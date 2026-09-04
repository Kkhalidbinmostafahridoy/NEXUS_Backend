import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { notificationController } from "./notification.controller";

export const notificationRoutes = Router();

notificationRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  notificationController.list,
);
notificationRoutes.post(
  "/:id/read",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  notificationController.markRead,
);
