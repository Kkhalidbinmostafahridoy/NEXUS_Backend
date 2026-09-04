import { prisma } from "../../../shared/prisma";
import { createEvent, eventTopics } from "../../../contracts/events";
import { eventProducer } from "../../../shared/kafka/producer";
import { tenantService } from "../tenant.service";

export const aiService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const incidentId = String(data.incidentId || "");
    await tenantService.incident(incidentId, organizationId);

    const investigation = await prisma.aiInvestigation.create({
      data: {
        incidentId,
        status: "PENDING",
      },
    });

    void eventProducer
      .publish(
        eventTopics.aiInvestigationRequested,
        createEvent(eventTopics.aiInvestigationRequested, organizationId, {
          investigationId: investigation.id,
          incidentId,
        }),
      )
      .catch(() => undefined);

    return investigation;
  },

  async get(id: string, organizationId: string) {
    const investigation = await prisma.aiInvestigation.findUnique({
      where: {
        id,
      },
    });
    if (!investigation) {
      throw Object.assign(new Error("AI investigation was not found."), { statusCode: 404 });
    }
    await tenantService.incident(investigation.incidentId, organizationId);
    return investigation;
  },

  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);
    const links = await prisma.incidentService.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
      },
      select: {
        incidentId: true,
      },
    });

    return prisma.aiInvestigation.findMany({
      where: {
        incidentId: {
          in: [...new Set(links.map((link) => link.incidentId))],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
