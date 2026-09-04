import { prisma } from "../../../shared/prisma";

export const notificationService = {
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
