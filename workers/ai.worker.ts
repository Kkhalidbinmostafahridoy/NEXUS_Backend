import "dotenv/config";

import { eventTopics } from "../src/contracts/events";
import { prisma } from "../src/shared/prisma";
import { eventConsumer } from "../src/shared/kafka/consumer";

type InvestigationResult = {
  summary?: string;
  rootCause?: string;
  confidence?: number;
  recommendations?: Array<{
    action: string;
    reason: string;
    confidence: number;
  }>;
};

const aiServiceUrl = (process.env.AI_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "");

void eventConsumer
  .subscribe(eventTopics.aiInvestigationRequested, "nexus-ai-worker", async (event) => {
    const investigationId = String(event.payload.investigationId);
    const incidentId = String(event.payload.incidentId);
    const investigation = await prisma.aiInvestigation.findUniqueOrThrow({
      where: {
        id: investigationId,
      },
    });
    const incident = await prisma.incident.findUniqueOrThrow({
      where: {
        id: incidentId,
      },
    });
    const evidence = await prisma.incidentEvent.findMany({
      where: {
        incidentId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    });

    const response = await fetch(`${aiServiceUrl}/investigate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        incident_id: incident.id,
        title: incident.title,
        evidence: evidence.map((item) => ({
          type: item.type,
          message: item.message,
          createdAt: item.createdAt,
        })),
      }),
    });
    if (!response.ok) {
      throw new Error(`AI provider returned ${response.status}`);
    }
    const result = (await response.json()) as InvestigationResult;

    await prisma.$transaction(async (transaction) => {
      await transaction.aiInvestigation.update({
        where: {
          id: investigation.id,
        },
        data: {
          status: "COMPLETED",
          summary: result.summary,
          rootCause: result.rootCause,
          confidence: result.confidence,
          completedAt: new Date(),
        },
      });
      if (result.recommendations?.length) {
        await transaction.aiRecommendation.createMany({
          data: result.recommendations.map((recommendation) => ({
            investigationId: investigation.id,
            action: recommendation.action,
            reason: recommendation.reason,
            confidence: recommendation.confidence,
          })),
        });
      }
    });
  })
  .catch((error) => {
    console.error("NEXUS AI worker failed to start", error);
    process.exitCode = 1;
  });
