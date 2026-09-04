import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const anomalyService = {
  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.anomaly.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
      },
      orderBy: {
        detectedAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const anomaly = await prisma.anomaly.findUnique({
      where: {
        id,
      },
    });

    if (!anomaly) {
      throw Object.assign(new Error("Anomaly was not found."), {
        statusCode: 404,
      });
    }

    await tenantService.service(anomaly.serviceId, organizationId);
    return anomaly;
  },
};
