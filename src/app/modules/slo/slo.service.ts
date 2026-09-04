import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const sloService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const serviceId = String(data.serviceId || "");
    await tenantService.service(serviceId, organizationId);

    return prisma.sloDefinition.create({
      data: {
        ...data,
        serviceId,
      } as never,
    });
  },

  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.sloDefinition.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const slo = await prisma.sloDefinition.findUnique({
      where: {
        id,
      },
    });

    if (!slo) {
      throw Object.assign(new Error("SLO was not found."), {
        statusCode: 404,
      });
    }

    await tenantService.service(slo.serviceId, organizationId);
    return slo;
  },

  async update(id: string, organizationId: string, data: Record<string, unknown>) {
    await this.get(id, organizationId);
    const { serviceId: _serviceId, ...updates } = data;

    return prisma.sloDefinition.update({
      where: {
        id,
      },
      data: updates,
    });
  },

  async measurements(id: string, organizationId: string) {
    await this.get(id, organizationId);

    return prisma.sloMeasurement.findMany({
      where: {
        sloId: id,
      },
      orderBy: {
        measuredAt: "desc",
      },
    });
  },

  async addMeasurement(id: string, organizationId: string, data: Record<string, unknown>) {
    await this.get(id, organizationId);

    return prisma.sloMeasurement.create({
      data: {
        sloId: id,
        value: Number(data.value),
        errorBudgetRemaining: Number(data.errorBudgetRemaining),
        measuredAt: data.measuredAt ? new Date(String(data.measuredAt)) : undefined,
      },
    });
  },
};
