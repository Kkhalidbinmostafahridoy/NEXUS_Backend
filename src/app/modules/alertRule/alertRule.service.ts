import { prisma } from "../../../shared/prisma";
export const alertRuleService = {
  create: (data: any) => prisma.alertRule.create({ data }),
  list: () => prisma.alertRule.findMany({ orderBy: { createdAt: "desc" } }),
  update: (id: string, data: any) => prisma.alertRule.update({ where: { id }, data }),
  setEnabled: (id: string, enabled: boolean) =>
    prisma.alertRule.update({ where: { id }, data: { enabled } }),
};
