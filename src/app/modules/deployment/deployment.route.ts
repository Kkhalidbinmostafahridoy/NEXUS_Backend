import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { deploymentController } from "./deployment.controller";

export const deploymentRoutes = Router();

deploymentRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), deploymentController.create);

deploymentRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  deploymentController.list,
);

deploymentRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  deploymentController.get,
);
