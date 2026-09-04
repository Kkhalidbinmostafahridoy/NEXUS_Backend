import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const aiService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const incidentId = String(data.incidentId || "");
    await tenantService.incident(incidentId, organizationId);

    return prisma.aiInvestigation.create({
      data: {
        incidentId,
        status: "PENDING",
      },
    });
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
