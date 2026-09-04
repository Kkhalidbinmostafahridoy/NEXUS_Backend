import { prisma } from "../../../shared/prisma";
export const organizationRepository = {
  findById: (id: string) => prisma.organization.findUnique({ where: { id } }),
};
