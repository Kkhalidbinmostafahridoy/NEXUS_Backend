import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const correlationService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const incidentId = String(data.incidentId || "");
    await tenantService.incident(incidentId, organizationId);

    return prisma.correlation.create({
      data: {
        incidentId,
        summary: String(data.summary || ""),
        confidence: Number(data.confidence),
        signals: data.signals as never,
      },
    });
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

    return prisma.correlation.findMany({
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

  async get(id: string, organizationId: string) {
    const correlation = await prisma.correlation.findUnique({
      where: {
        id,
      },
    });

    if (!correlation?.incidentId) {
      throw Object.assign(new Error("Correlation was not found."), { statusCode: 404 });
    }

    await tenantService.incident(correlation.incidentId, organizationId);
    return correlation;
  },
};
