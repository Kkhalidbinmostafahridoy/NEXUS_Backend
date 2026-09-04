import { prisma } from "../../../shared/prisma";
export const serviceRepository = {
  findById: (id: string) => prisma.service.findUnique({ where: { id } }),
};
