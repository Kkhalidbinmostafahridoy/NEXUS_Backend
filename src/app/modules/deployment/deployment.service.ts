import { prisma } from "../../../shared/prisma";
import { createEvent, eventTopics } from "../../../contracts/events";
import { eventProducer } from "../../../shared/kafka/producer";
import { tenantService } from "../tenant.service";

export const deploymentService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const serviceId = String(data.serviceId || "");
    await tenantService.service(serviceId, organizationId);

    const deployment = await prisma.deployment.create({
      data: {
        ...data,
        serviceId,
      } as never,
    });

    const incidentLinks = await prisma.incidentService.findMany({
      where: {
        serviceId,
      },
      select: {
        incidentId: true,
      },
    });
    const activeIncidents = await prisma.incident.findMany({
      where: {
        id: {
          in: incidentLinks.map((link) => link.incidentId),
        },
        status: {
          in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "MITIGATING"],
        },
      },
    });

    await Promise.all(
      activeIncidents.map(async (incident) => {
        await prisma.incidentEvent.create({
          data: {
            incidentId: incident.id,
            type: "DEPLOYMENT_CORRELATED",
            message: `Deployment ${deployment.id} (${deployment.version}) correlated with this incident.`,
            metadata: {
              deploymentId: deployment.id,
              serviceId,
              version: deployment.version,
            },
          },
        });
        await prisma.correlation.create({
          data: {
            incidentId: incident.id,
            summary: `Deployment ${deployment.version} was observed during the active incident.`,
            confidence: 0.6,
            signals: {
              deploymentId: deployment.id,
              serviceId,
              version: deployment.version,
            },
          },
        });
      }),
    );

    void eventProducer
      .publish(
        eventTopics.deploymentCreated,
        createEvent(eventTopics.deploymentCreated, organizationId, {
          deploymentId: deployment.id,
          serviceId,
          version: deployment.version,
        }),
      )
      .catch(() => undefined);

    return deployment;
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
