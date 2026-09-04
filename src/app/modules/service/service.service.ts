import argon2 from "argon2";
import { randomBytes } from "crypto";

import { prisma } from "../../../shared/prisma";
import { tenantService } from "../tenant.service";

export const serviceService = {
  async create(organizationId: string, data: Record<string, unknown>) {
    const projectId = String(data.projectId || "");
    await tenantService.project(projectId, organizationId);

    return prisma.service.create({
      data: {
        ...data,
        projectId,
      } as never,
    });
  },

  async list(organizationId: string) {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
      },
    });

    return prisma.service.findMany({
      where: {
        projectId: {
          in: projects.map((project) => project.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    return tenantService.service(id, organizationId);
  },

  async update(id: string, organizationId: string, data: Record<string, unknown>) {
    await tenantService.service(id, organizationId);
    const { projectId: _projectId, ...updates } = data;

    return prisma.service.update({
      where: {
        id,
      },
      data: updates,
    });
  },

  async remove(id: string, organizationId: string) {
    await tenantService.service(id, organizationId);

    return prisma.service.delete({
      where: {
        id,
      },
    });
  },

  async dependencies(serviceId: string, organizationId: string) {
    await tenantService.service(serviceId, organizationId);

    return prisma.serviceDependency.findMany({
      where: {
        serviceId,
      },
    });
  },

  async addDependency(serviceId: string, organizationId: string, data: Record<string, unknown>) {
    await tenantService.service(serviceId, organizationId);
    const dependsOnServiceId = String(data.dependsOnServiceId || "");

    if (dependsOnServiceId === serviceId) {
      throw Object.assign(new Error("A service cannot depend on itself."), {
        statusCode: 400,
      });
    }

    await tenantService.service(dependsOnServiceId, organizationId);

    return prisma.serviceDependency.create({
      data: {
        serviceId,
        dependsOnServiceId,
        type: String(data.type || "HTTP"),
      },
    });
  },

  async createApiKey(serviceId: string, organizationId: string, name: string) {
    await tenantService.service(serviceId, organizationId);
    const secret = `nx_live_${randomBytes(24).toString("hex")}`;
    const key = await prisma.apiKey.create({
      data: {
        name,
        prefix: secret.slice(0, 16),
        keyHash: await argon2.hash(secret),
        serviceId,
        organizationId,
      },
    });

    return {
      id: key.id,
      name: key.name,
      apiKey: secret,
    };
  },
};
