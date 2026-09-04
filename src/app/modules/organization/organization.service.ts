import { Role } from "@prisma/client";

import { prisma } from "../../../shared/prisma";

const notFound = (message: string) => Object.assign(new Error(message), { statusCode: 404 });

export const organizationService = {
  async create(userId: string, name: string) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug || "organization"}-${crypto.randomUUID().slice(0, 8)}`;

    return prisma.$transaction(async (transaction) => {
      const organization = await transaction.organization.create({
        data: {
          name,
          slug,
        },
      });

      await transaction.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId,
          role: Role.OWNER,
        },
      });

      return organization;
    });
  },

  async list(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId,
      },
      select: {
        organizationId: true,
        role: true,
      },
    });
    const organizations = await prisma.organization.findMany({
      where: {
        id: {
          in: memberships.map((membership) => membership.organizationId),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return organizations.map((organization) => ({
      ...organization,
      role: memberships.find((membership) => membership.organizationId === organization.id)?.role,
    }));
  },

  async get(id: string, organizationId: string) {
    if (id !== organizationId) throw notFound("Organization was not found.");

    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    });
    if (!organization) throw notFound("Organization was not found.");
    return organization;
  },

  async update(id: string, organizationId: string, name: string) {
    await this.get(id, organizationId);
    return prisma.organization.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  },

  async members(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
    });
  },

  async addMember(organizationId: string, userId: string, role: Role) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw notFound("User was not found.");

    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
    });
  },
};
