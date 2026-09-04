import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { correlationController } from "./correlation.controller";

export const correlationRoutes = Router();

correlationRoutes.post(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  correlationController.create,
);
correlationRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  correlationController.list,
);
correlationRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  correlationController.get,
);
