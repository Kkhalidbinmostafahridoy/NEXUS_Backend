import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const runbookService = {
  async create(organizationId: string, userId: string, data: Record<string, unknown>) {
    const serviceId = data.serviceId ? String(data.serviceId) : undefined;

    if (serviceId) {
      await tenantService.service(serviceId, organizationId);
    }

    return prisma.runbook.create({
      data: {
        title: String(data.title || ""),
        content: String(data.content || ""),
        serviceId,
        createdById: userId,
      },
    });
  },

  async list(organizationId: string, userId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.runbook.findMany({
      where: {
        OR: [
          {
            serviceId: {
              in: serviceIds,
            },
          },
          {
            createdById: userId,
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string, userId: string) {
    const runbook = await prisma.runbook.findUnique({
      where: {
        id,
      },
    });

    if (!runbook) {
      throw Object.assign(new Error("Runbook was not found."), { statusCode: 404 });
    }

    if (runbook.serviceId) {
      await tenantService.service(runbook.serviceId, organizationId);
    } else if (runbook.createdById !== userId) {
      throw Object.assign(new Error("Runbook does not belong to the active organization."), {
        statusCode: 403,
      });
    }

    return runbook;
  },

  async update(id: string, organizationId: string, userId: string, data: Record<string, unknown>) {
    await this.get(id, organizationId, userId);
    const { serviceId: _serviceId, createdById: _createdById, ...updates } = data;

    return prisma.runbook.update({
      where: {
        id,
      },
      data: updates,
    });
  },
};
