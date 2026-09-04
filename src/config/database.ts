import { prisma } from "../shared/prisma";
export const verifyDatabase = () => prisma.$queryRawUnsafe("SELECT 1");
