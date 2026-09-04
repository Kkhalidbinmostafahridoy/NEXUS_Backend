import { prisma } from "../../../shared/prisma";
export const alertRuleRepository = {
  findById: (id: string) => prisma.alertRule.findUnique({ where: { id } }),
};
