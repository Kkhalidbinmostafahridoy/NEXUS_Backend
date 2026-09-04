import { prisma } from "../../../shared/prisma";
export const serviceService = {
  create: (data: any) => prisma.service.create({ data }),
  list: () => prisma.service.findMany({ orderBy: { createdAt: "desc" } }),
  get: (id: string) => prisma.service.findUniqueOrThrow({ where: { id } }),
  update: (id: string, data: any) => prisma.service.update({ where: { id }, data }),
  remove: (id: string) => prisma.service.delete({ where: { id } }),
  dependencies: (serviceId: string) => prisma.serviceDependency.findMany({ where: { serviceId } }),
  addDependency: (serviceId: string, data: any) =>
    prisma.serviceDependency.create({
      data: { serviceId, dependsOnServiceId: data.dependsOnServiceId, type: data.type ?? "HTTP" },
    }),
};
