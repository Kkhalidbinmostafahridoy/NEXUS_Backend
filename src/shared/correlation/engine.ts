import { Severity } from "@prisma/client";

import { eventTopics } from "../../contracts/events";
import { publishDomainEvent } from "../events/publisher";
import { prisma } from "../prisma";

export type CorrelationSignal = {
  organizationId: string;
  serviceId: string;
  signalType: "alert" | "anomaly" | "deployment";
  signalId: string;
  metadata?: Record<string, unknown>;
};

const activeIncidentStatuses = ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "MITIGATING"] as const;

const deploymentWindowMs = 30 * 60 * 1000;
const anomalyWindowMs = 15 * 60 * 1000;

export const correlationEngine = {
  async evaluate(signal: CorrelationSignal) {
    const service = await prisma.service.findUnique({
      where: { id: signal.serviceId },
      select: { id: true, name: true, projectId: true },
    });
    if (!service) return null;

    const dependencies = await prisma.serviceDependency.findMany({
      where: { serviceId: signal.serviceId },
      select: { dependsOnServiceId: true },
    });
    const dependencyIds = dependencies.map((item) => item.dependsOnServiceId);
    const scopedServiceIds = [signal.serviceId, ...dependencyIds];

    const incidentLinks = await prisma.incidentService.findMany({
      where: { serviceId: { in: scopedServiceIds } },
      select: { incidentId: true },
    });
    const incidentIds = [...new Set(incidentLinks.map((link) => link.incidentId))];
    if (!incidentIds.length) return null;

    const activeIncident = await prisma.incident.findFirst({
      where: {
        id: { in: incidentIds },
        status: { in: [...activeIncidentStatuses] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!activeIncident) return null;

    const sinceDeployment = new Date(Date.now() - deploymentWindowMs);
    const sinceAnomaly = new Date(Date.now() - anomalyWindowMs);

    const [recentDeployment, recentAnomalies, openAlerts, dependencyAnomalies] = await Promise.all([
      prisma.deployment.findFirst({
        where: {
          serviceId: signal.serviceId,
          deployedAt: { gte: sinceDeployment },
        },
        orderBy: { deployedAt: "desc" },
      }),
      prisma.anomaly.findMany({
        where: {
          serviceId: signal.serviceId,
          detectedAt: { gte: sinceAnomaly },
        },
        orderBy: { detectedAt: "desc" },
        take: 5,
      }),
      prisma.alert.findMany({
        where: {
          serviceId: { in: scopedServiceIds },
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
        take: 10,
      }),
      dependencyIds.length
        ? prisma.anomaly.findMany({
            where: {
              serviceId: { in: dependencyIds },
              detectedAt: { gte: sinceAnomaly },
            },
            orderBy: { detectedAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    let confidence = 0.35;
    const signals: Record<string, unknown> = {
      trigger: signal.signalType,
      triggerId: signal.signalId,
      serviceId: signal.serviceId,
      serviceName: service.name,
    };

    if (recentDeployment) {
      confidence += 0.35;
      signals.deploymentId = recentDeployment.id;
      signals.deploymentVersion = recentDeployment.version;
      signals.deploymentAgeMinutes = Math.round(
        (Date.now() - recentDeployment.deployedAt.getTime()) / 60000,
      );
    }

    if (recentAnomalies.length) {
      confidence += Math.min(0.2, recentAnomalies.length * 0.05);
      signals.anomalies = recentAnomalies.map((item) => ({
        id: item.id,
        metric: item.metric,
        score: item.score,
      }));
    }

    if (dependencyAnomalies.length) {
      confidence += Math.min(0.15, dependencyAnomalies.length * 0.05);
      signals.dependencyAnomalies = dependencyAnomalies.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        metric: item.metric,
        score: item.score,
      }));
    }

    if (openAlerts.length) {
      confidence += Math.min(0.1, openAlerts.length * 0.03);
      signals.openAlerts = openAlerts.length;
    }

    confidence = Math.min(Number(confidence.toFixed(2)), 0.99);
    if (confidence < 0.5) return null;

    let summary = `Correlated ${signal.signalType} on ${service.name}`;
    if (recentDeployment) {
      summary = `Likely related to recent deployment ${recentDeployment.version} on ${service.name}`;
    } else if (dependencyAnomalies.length) {
      summary = `Upstream dependency anomalies detected alongside ${service.name} signals`;
    } else if (recentAnomalies.length) {
      summary = `Metric anomalies detected on ${service.name}`;
    }

    const correlation = await prisma.correlation.create({
      data: {
        incidentId: activeIncident.id,
        summary,
        confidence,
        signals: signals as never,
      },
    });

    await prisma.incidentEvent.create({
      data: {
        incidentId: activeIncident.id,
        type: "CORRELATION_DETECTED",
        message: summary,
        metadata: {
          correlationId: correlation.id,
          confidence,
          signalType: signal.signalType,
          signalId: signal.signalId,
        },
      },
    });

    publishDomainEvent(eventTopics.incidentUpdated, signal.organizationId, {
      incidentId: activeIncident.id,
      changeType: "correlation_detected",
      status: activeIncident.status,
      severity: activeIncident.severity,
      correlationId: correlation.id,
      confidence,
    });

    return correlation;
  },
};

export const severityFromAnomalyScore = (score: number): Severity | null => {
  if (score >= 5) return Severity.P2;
  if (score >= 4) return Severity.P3;
  return null;
};
