import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { organizationController } from "./organization.controller";

export const organizationRoutes = Router();

organizationRoutes.post("/", auth(), organizationController.create);
organizationRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  organizationController.list,
);
organizationRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  organizationController.get,
);
organizationRoutes.patch("/:id", auth(Role.OWNER), organizationController.update);
organizationRoutes.get(
  "/:id/members",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  organizationController.members,
);
organizationRoutes.post(
  "/:id/members",
  auth(Role.OWNER, Role.ADMIN),
  organizationController.addMember,
);
