import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const deploymentService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const serviceId = String(data.serviceId || "");
    await tenantService.service(serviceId, organizationId);

    return prisma.deployment.create({
      data: {
        ...data,
        serviceId,
      } as never,
    });
  },

  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.deployment.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
      },
      orderBy: {
        deployedAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const deployment = await prisma.deployment.findUnique({
      where: {
        id,
      },
    });

    if (!deployment) {
      throw Object.assign(new Error("Deployment was not found."), {
        statusCode: 404,
      });
    }

    await tenantService.service(deployment.serviceId, organizationId);
    return deployment;
  },
};
