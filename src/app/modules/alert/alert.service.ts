import { AlertStatus } from "@prisma/client";

import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const alertService = {
  async list(organizationId: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    return prisma.alert.findMany({
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
    const alert = await prisma.alert.findUnique({
      where: {
        id,
      },
    });

    if (!alert) {
      throw Object.assign(new Error("Alert was not found."), {
        statusCode: 404,
      });
    }

    await tenantService.service(alert.serviceId, organizationId);
    return alert;
  },

  async acknowledge(id: string, organizationId: string) {
    await this.get(id, organizationId);

    return prisma.alert.update({
      where: {
        id,
      },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date(),
      },
    });
  },

  async resolve(id: string, organizationId: string) {
    await this.get(id, organizationId);

    return prisma.alert.update({
      where: {
        id,
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });
  },
};
