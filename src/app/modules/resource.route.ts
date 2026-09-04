import { Request, Response, Router } from "express";
import { Role } from "@prisma/client";

import { auth } from "../../middlewares/auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { prisma } from "../../shared/prisma";

type ModelName = keyof typeof prisma;

export const createResourceRoutes = (modelName: ModelName, label: string) => {
  const router = Router();
  const repository = () => (prisma as any)[modelName];
  const readRoles = [Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER];
  const writeRoles = [Role.OWNER, Role.ADMIN, Role.MEMBER];

  router.get(
    "/",
    auth(...readRoles),
    catchAsync(async (_req: Request, res: Response) => {
      const data = await repository().findMany({ orderBy: { createdAt: "desc" } });
      return sendResponse(res, 200, `${label} retrieved`, data);
    }),
  );

  router.post(
    "/",
    auth(...writeRoles),
    catchAsync(async (req: Request, res: Response) => {
      const data = await repository().create({ data: req.body });
      return sendResponse(res, 201, `${label} created`, data);
    }),
  );

  router.get(
    "/:id",
    auth(...readRoles),
    catchAsync(async (req: Request, res: Response) => {
      const data = await repository().findUniqueOrThrow({ where: { id: req.params.id } });
      return sendResponse(res, 200, `${label} retrieved`, data);
    }),
  );

  router.patch(
    "/:id",
    auth(...writeRoles),
    catchAsync(async (req: Request, res: Response) => {
      const data = await repository().update({ where: { id: req.params.id }, data: req.body });
      return sendResponse(res, 200, `${label} updated`, data);
    }),
  );

  router.delete(
    "/:id",
    auth(Role.OWNER, Role.ADMIN),
    catchAsync(async (req: Request, res: Response) => {
      const data = await repository().delete({ where: { id: req.params.id } });
      return sendResponse(res, 200, `${label} deleted`, data);
    }),
  );

  return router;
};
