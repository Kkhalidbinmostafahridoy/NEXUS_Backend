import { prisma } from "../../../shared/prisma";

import { tenantService } from "../tenant.service";

export const projectService = {
  create: (data: any) => prisma.project.create({ data }),
  list: (organizationId: string) =>
    prisma.project.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
  get: (id: string, organizationId: string) => tenantService.project(id, organizationId),
  update: async (id: string, organizationId: string, data: any) => {
    await tenantService.project(id, organizationId);
    const { organizationId: _organizationId, ...safeData } = data;
    return prisma.project.update({ where: { id }, data: safeData });
  },
  remove: async (id: string, organizationId: string) => {
    await tenantService.project(id, organizationId);
    return prisma.project.delete({ where: { id } });
  },
};
