import { prisma } from "../../../shared/prisma";

export const documentService = {
  create(organizationId: string, data: Record<string, unknown>) {
    return prisma.document.create({
      data: {
        organizationId,
        title: String(data.title || ""),
        content: String(data.content || ""),
        sourceUrl: data.sourceUrl ? String(data.sourceUrl) : undefined,
      },
    });
  },

  list(organizationId: string) {
    return prisma.document.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async get(id: string, organizationId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!document) {
      throw Object.assign(new Error("Document was not found."), { statusCode: 404 });
    }

    return document;
  },

  async update(id: string, organizationId: string, data: Record<string, unknown>) {
    await this.get(id, organizationId);

    return prisma.document.update({
      where: {
        id,
      },
      data: {
        title: data.title ? String(data.title) : undefined,
        content: data.content ? String(data.content) : undefined,
        sourceUrl: data.sourceUrl === null ? null : data.sourceUrl ? String(data.sourceUrl) : undefined,
      },
    });
  },
};
