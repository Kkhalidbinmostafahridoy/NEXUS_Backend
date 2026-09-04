import { IncidentStatus, Prisma, Severity } from "@prisma/client";

import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

type CreateIncidentInput = {
  serviceId: string;
  title: string;
  description?: string;
  severity: Severity;
  assigneeId?: string;
};

type IncidentUpdateInput = {
  title?: string;
  description?: string | null;
  severity?: Severity;
};

const allowedTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: [IncidentStatus.ACKNOWLEDGED, IncidentStatus.INVESTIGATING, IncidentStatus.RESOLVED],
  ACKNOWLEDGED: [IncidentStatus.INVESTIGATING, IncidentStatus.MITIGATING, IncidentStatus.RESOLVED],
  INVESTIGATING: [IncidentStatus.MITIGATING, IncidentStatus.RESOLVED],
  MITIGATING: [IncidentStatus.RESOLVED],
  RESOLVED: [IncidentStatus.OPEN],
};

const badRequest = (message: string) => Object.assign(new Error(message), { statusCode: 400 });

const notFound = (message: string) => Object.assign(new Error(message), { statusCode: 404 });

export const incidentService = {
  async create(organizationId: string, actorId: string, input: CreateIncidentInput) {
    await tenantService.service(input.serviceId, organizationId);

    if (input.assigneeId) {
      await this.ensureOrganizationMember(input.assigneeId, organizationId);
    }

    return prisma.$transaction(async (transaction) => {
      const incident = await transaction.incident.create({
        data: {
          title: input.title,
          description: input.description,
          severity: input.severity,
          assigneeId: input.assigneeId,
        },
      });

      await transaction.incidentService.create({
        data: {
          incidentId: incident.id,
          serviceId: input.serviceId,
        },
      });

      await transaction.incidentEvent.create({
        data: {
          incidentId: incident.id,
          type: "INCIDENT_CREATED",
          message: "Incident created manually.",
          actorId,
        },
      });

      return incident;
    });
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

    return prisma.incident.findMany({
      where: {
        id: {
          in: [...new Set(links.map((link) => link.incidentId))],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    return tenantService.incident(id, organizationId);
  },

  async update(id: string, organizationId: string, actorId: string, input: IncidentUpdateInput) {
    await tenantService.incident(id, organizationId);

    const incident = await prisma.incident.update({
      where: {
        id,
      },
      data: input,
    });

    await this.addTimeline(
      id,
      organizationId,
      actorId,
      "INCIDENT_UPDATED",
      "Incident details updated.",
    );

    return incident;
  },

  async transition(
    id: string,
    organizationId: string,
    actorId: string,
    nextStatus: IncidentStatus,
  ) {
    const incident = await tenantService.incident(id, organizationId);

    if (!allowedTransitions[incident.status].includes(nextStatus)) {
      throw badRequest(`Cannot transition an incident from ${incident.status} to ${nextStatus}.`);
    }

    const updated = await prisma.incident.update({
      where: {
        id,
      },
      data: {
        status: nextStatus,
        resolvedAt: nextStatus === IncidentStatus.RESOLVED ? new Date() : null,
      },
    });

    await this.addTimeline(
      id,
      organizationId,
      actorId,
      "STATUS_CHANGED",
      `Incident status changed from ${incident.status} to ${nextStatus}.`,
    );

    return updated;
  },

  async assign(id: string, organizationId: string, actorId: string, assigneeId: string | null) {
    await tenantService.incident(id, organizationId);

    if (assigneeId) {
      await this.ensureOrganizationMember(assigneeId, organizationId);
    }

    const incident = await prisma.incident.update({
      where: {
        id,
      },
      data: {
        assigneeId,
      },
    });

    await this.addTimeline(
      id,
      organizationId,
      actorId,
      "ASSIGNEE_CHANGED",
      assigneeId ? `Incident assigned to ${assigneeId}.` : "Incident assignment cleared.",
    );

    return incident;
  },

  async timeline(id: string, organizationId: string) {
    await tenantService.incident(id, organizationId);

    return prisma.incidentEvent.findMany({
      where: {
        incidentId: id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async addTimeline(
    id: string,
    organizationId: string,
    actorId: string,
    type: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    await tenantService.incident(id, organizationId);

    return prisma.incidentEvent.create({
      data: {
        incidentId: id,
        type,
        message,
        metadata: metadata as Prisma.InputJsonValue | undefined,
        actorId,
      },
    });
  },

  async findOrCreateForAlert(
    serviceId: string,
    title: string,
    severity: Severity,
    alertId: string,
  ) {
    const links = await prisma.incidentService.findMany({
      where: {
        serviceId,
      },
      select: {
        incidentId: true,
      },
    });
    const incidentIds = links.map((link) => link.incidentId);
    const activeIncident =
      incidentIds.length > 0
        ? await prisma.incident.findFirst({
            where: {
              id: {
                in: incidentIds,
              },
              status: {
                in: [
                  IncidentStatus.OPEN,
                  IncidentStatus.ACKNOWLEDGED,
                  IncidentStatus.INVESTIGATING,
                  IncidentStatus.MITIGATING,
                ],
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          })
        : null;

    if (activeIncident) {
      await prisma.incidentEvent.create({
        data: {
          incidentId: activeIncident.id,
          type: "ALERT_CORRELATED",
          message: `Alert ${alertId} correlated with the active incident.`,
          metadata: {
            alertId,
            serviceId,
          },
        },
      });

      return {
        incident: activeIncident,
        created: false,
      };
    }

    const incident = await prisma.$transaction(async (transaction) => {
      const created = await transaction.incident.create({
        data: {
          title,
          description: `Created automatically from alert ${alertId}.`,
          severity,
        },
      });

      await transaction.incidentService.create({
        data: {
          incidentId: created.id,
          serviceId,
        },
      });

      await transaction.incidentEvent.create({
        data: {
          incidentId: created.id,
          type: "ALERT_TRIGGERED",
          message: `Alert ${alertId} triggered this incident.`,
          metadata: {
            alertId,
            serviceId,
          },
        },
      });

      return created;
    });

    return {
      incident,
      created: true,
    };
  },

  async ensureOrganizationMember(userId: string, organizationId: string) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!member) {
      throw notFound("Assignee is not a member of the active organization.");
    }

    return member;
  },
};
