import { prisma } from "../../../shared/prisma";
export const incidentRepository = {
  findById: (id: string) => prisma.incident.findUnique({ where: { id } }),
};
