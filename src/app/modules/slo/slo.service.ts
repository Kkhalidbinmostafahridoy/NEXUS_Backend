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

  async calculateForMetric(serviceId: string, metric: string, value: number) {
    const definitions = await prisma.sloDefinition.findMany({
      where: {
        serviceId,
        indicator: metric,
      },
    });
    if (!definitions.length) return [];

    return Promise.all(
      definitions.map(async (definition) => {
        const start = new Date();
        start.setDate(start.getDate() - definition.windowDays);
        const events = await prisma.telemetryEvent.findMany({
          where: {
            kind: "metrics",
            serviceId,
            timestamp: {
              gte: start,
            },
          },
          select: {
            payload: true,
          },
        });
        const samples = events
          .map((event) => event.payload as Record<string, unknown>)
          .filter((payload) => payload.metric === metric);
        const good = samples.filter(
          (payload) =>
            payload.good !== false &&
            (typeof payload.status !== "number" || (payload.status >= 200 && payload.status < 500)),
        ).length;
        const achieved = samples.length ? good / samples.length : 1;
        const objective =
          definition.objective > 1 ? definition.objective / 100 : definition.objective;
        const errorBudgetRemaining =
          objective >= 1
            ? achieved >= objective
              ? 100
              : 0
            : Math.max(0, Math.min(100, ((achieved - objective) / (1 - objective)) * 100));

        return prisma.sloMeasurement.create({
          data: {
            sloId: definition.id,
            value: achieved * 100,
            errorBudgetRemaining,
          },
        });
      }),
    );
  },
};
