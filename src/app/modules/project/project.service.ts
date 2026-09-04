import { prisma } from "../../../shared/prisma";
export const projectService = {
  create: (data: any) => prisma.project.create({ data }),
  list: () => prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  get: (id: string) => prisma.project.findUniqueOrThrow({ where: { id } }),
  update: (id: string, data: any) => prisma.project.update({ where: { id }, data }),
  remove: (id: string) => prisma.project.delete({ where: { id } }),
};
