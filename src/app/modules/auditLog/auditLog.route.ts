import { Role } from "@prisma/client";
import { Router } from "express";

import { auth, AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { prisma } from "../../../shared/prisma";

export const auditLogRoutes = Router();

auditLogRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  catchAsync(async (request: AuthRequest, response) => {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId: request.user?.sub,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    sendResponse(response, 200, "Audit logs retrieved", logs);
  }),
);
