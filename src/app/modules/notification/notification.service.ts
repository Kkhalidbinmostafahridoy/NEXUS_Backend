import { eventTopics } from "../../../contracts/events";
import { publishDomainEvent } from "../../../shared/events/publisher";
import { prisma } from "../../../shared/prisma";

export const notificationService = {
  request(
    organizationId: string,
    payload: {
      channel: string;
      title: string;
      body: string;
      incidentId?: string;
      alertId?: string;
      userId?: string;
    },
  ) {
    publishDomainEvent(eventTopics.notificationRequested, organizationId, payload);
  },
  list(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async markRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw Object.assign(new Error("Notification was not found."), { statusCode: 404 });
    }

    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        readAt: new Date(),
      },
    });
  },
};
