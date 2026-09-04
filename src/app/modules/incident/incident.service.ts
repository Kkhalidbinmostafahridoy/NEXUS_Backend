import { prisma } from "../../../shared/prisma";
export const incidentService = {
  create: async (data: any) => {
    const { serviceId, ...incident } = data;
    const saved = await prisma.incident.create({ data: incident });
    if (serviceId)
      await prisma.incidentService.create({
        data: { incidentId: saved.id, serviceId },
      });
    return saved;
  },
  list: () => prisma.incident.findMany({ orderBy: { createdAt: "desc" } }),
  get: (id: string) => prisma.incident.findUniqueOrThrow({ where: { id } }),
  update: (id: string, data: any) => prisma.incident.update({ where: { id }, data }),
  transition: (id: string, status: any) =>
    prisma.incident.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    }),
  timeline: (id: string) =>
    prisma.incidentEvent.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "asc" },
    }),
};
