import { prisma } from "../../../shared/prisma";
export const organizationService = {
  create: (data: any) => prisma.organization.create({ data }),
  list: () => prisma.organization.findMany({ orderBy: { createdAt: "desc" } }),
  get: (id: string) => prisma.organization.findUniqueOrThrow({ where: { id } }),
  update: (id: string, data: any) => prisma.organization.update({ where: { id }, data }),
  remove: (id: string) => prisma.organization.delete({ where: { id } }),
  members: (organizationId: string) =>
    prisma.organizationMember.findMany({ where: { organizationId } }),
  addMember: (organizationId: string, data: any) =>
    prisma.organizationMember.create({
      data: { organizationId, userId: data.userId, role: data.role ?? "MEMBER" },
    }),
};
