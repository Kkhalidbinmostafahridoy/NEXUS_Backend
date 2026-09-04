import { Request, Response } from "express";
import { prisma } from "../../shared/prisma";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
export const createCrud = (model: string, label: string) => {
  const repo = () => (prisma as any)[model];
  return {
    create: catchAsync(async (req: Request, res: Response) =>
      sendResponse(res, 201, `${label} created`, await repo().create({ data: req.body })),
    ),
    list: catchAsync(async (_req: Request, res: Response) =>
      sendResponse(
        res,
        200,
        `${label} list`,
        await repo().findMany({ orderBy: { createdAt: "desc" } }),
      ),
    ),
    get: catchAsync(async (req: Request, res: Response) =>
      sendResponse(
        res,
        200,
        `${label} retrieved`,
        await repo().findUniqueOrThrow({ where: { id: req.params.id } }),
      ),
    ),
    update: catchAsync(async (req: Request, res: Response) =>
      sendResponse(
        res,
        200,
        `${label} updated`,
        await repo().update({ where: { id: req.params.id }, data: req.body }),
      ),
    ),
    remove: catchAsync(async (req: Request, res: Response) =>
      sendResponse(
        res,
        200,
        `${label} deleted`,
        await repo().delete({ where: { id: req.params.id } }),
      ),
    ),
  };
};
