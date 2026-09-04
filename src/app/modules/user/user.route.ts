import { Role } from "@prisma/client";
import { Router } from "express";

import { auth, AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { prisma } from "../../../shared/prisma";

export const userRoutes = Router();

userRoutes.get(
  "/me",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  catchAsync(async (request: AuthRequest, response) => {
    const user = await prisma.user.findUnique({
      where: {
        id: request.user?.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    sendResponse(response, 200, "User retrieved", user);
  }),
);
