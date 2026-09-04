import { prisma } from "../../shared/prisma";

const forbidden = () =>
  Object.assign(new Error("Resource does not belong to the active organization"), {
    statusCode: 403,
  });

export const tenantService = {
  async project(projectId: string, organizationId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.organizationId !== organizationId) throw forbidden();
    return project;
  },
  async service(serviceId: string, organizationId: string) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw forbidden();
    await this.project(service.projectId, organizationId);
    return service;
  },
  async incident(incidentId: string, organizationId: string) {
    const links = await prisma.incidentService.findMany({ where: { incidentId } });
    if (!links.length) throw forbidden();
    await Promise.all(links.map((link) => this.service(link.serviceId, organizationId)));
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw forbidden();
    return incident;
  },
  async serviceIds(organizationId: string) {
    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const services = await prisma.service.findMany({
      where: { projectId: { in: projects.map((project) => project.id) } },
      select: { id: true },
    });
    return services.map((service) => service.id);
  },
};
