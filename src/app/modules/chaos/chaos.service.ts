import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const chaosService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const targetServiceId = String(data.targetServiceId || "");
    await tenantService.service(targetServiceId, organizationId);

    return prisma.chaosExperiment.create({
      data: {
        name: String(data.name || ""),
        targetServiceId,
        type: String(data.type || ""),
        duration: Number(data.duration),
        value: Number(data.value),
      },
    });
  },

  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.chaosExperiment.findMany({
      where: {
        targetServiceId: {
          in: serviceIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const experiment = await prisma.chaosExperiment.findUnique({
      where: {
        id,
      },
    });

    if (!experiment) {
      throw Object.assign(new Error("Chaos experiment was not found."), { statusCode: 404 });
    }

    await tenantService.service(experiment.targetServiceId, organizationId);
    return experiment;
  },

  async start(id: string, organizationId: string) {
    const experiment = await this.get(id, organizationId);

    if (experiment.status !== "DRAFT") {
      throw Object.assign(new Error("Only draft experiments can be started."), {
        statusCode: 400,
      });
    }

    return prisma.chaosExperiment.update({
      where: {
        id,
      },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
  },

  async stop(id: string, organizationId: string) {
    const experiment = await this.get(id, organizationId);

    if (experiment.status !== "RUNNING") {
      throw Object.assign(new Error("Only running experiments can be stopped."), {
        statusCode: 400,
      });
    }

    return prisma.chaosExperiment.update({
      where: {
        id,
      },
      data: {
        status: "STOPPED",
        stoppedAt: new Date(),
      },
    });
  },
};
