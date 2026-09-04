import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const postmortemService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const incidentId = String(data.incidentId || "");
    await tenantService.incident(incidentId, organizationId);

    return prisma.postmortem.create({
      data: {
        ...data,
        incidentId,
      } as never,
    });
  },

  async get(id: string, organizationId: string) {
    const postmortem = await prisma.postmortem.findUnique({
      where: {
        id,
      },
    });

    if (!postmortem) {
      throw Object.assign(new Error("Postmortem was not found."), { statusCode: 404 });
    }

    await tenantService.incident(postmortem.incidentId, organizationId);
    return postmortem;
  },

  async list(organizationId: string) {
    const incidents = await tenantService.serviceIds(organizationId);
    const links = await prisma.incidentService.findMany({
      where: {
        serviceId: {
          in: incidents,
        },
      },
      select: {
        incidentId: true,
      },
    });

    return prisma.postmortem.findMany({
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

  async update(id: string, organizationId: string, data: Record<string, unknown>) {
    await this.get(id, organizationId);
    const { incidentId: _incidentId, ...updates } = data;

    return prisma.postmortem.update({
      where: {
        id,
      },
      data: updates,
    });
  },
};
