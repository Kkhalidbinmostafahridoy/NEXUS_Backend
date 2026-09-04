import { prisma } from "../../../shared/prisma";

const notFound = (message: string) => Object.assign(new Error(message), { statusCode: 404 });

export const teamService = {
  create(organizationId: string, name: string) {
    return prisma.team.create({
      data: {
        name,
        organizationId,
      },
    });
  },

  list(organizationId: string) {
    return prisma.team.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!team) throw notFound("Team was not found.");
    return team;
  },

  async update(id: string, organizationId: string, name: string) {
    await this.get(id, organizationId);
    return prisma.team.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  },

  async members(id: string, organizationId: string) {
    await this.get(id, organizationId);
    return prisma.teamMember.findMany({
      where: {
        teamId: id,
      },
    });
  },

  async addMember(id: string, organizationId: string, userId: string) {
    await this.get(id, organizationId);
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
    if (!membership) throw notFound("User is not a member of the active organization.");

    return prisma.teamMember.create({
      data: {
        teamId: id,
        userId,
      },
    });
  },
};
