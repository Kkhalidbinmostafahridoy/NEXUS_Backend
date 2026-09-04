import { prisma } from "../../../shared/prisma";
export const projectRepository = {
  findById: (id: string) => prisma.project.findUnique({ where: { id } }),
};
