import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { sloController } from "./slo.controller";

export const sloRoutes = Router();

sloRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), sloController.create);
sloRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), sloController.list);
sloRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), sloController.get);
sloRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), sloController.update);
sloRoutes.get(
  "/:id/measurements",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  sloController.measurements,
);
sloRoutes.post(
  "/:id/measurements",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  sloController.addMeasurement,
);
