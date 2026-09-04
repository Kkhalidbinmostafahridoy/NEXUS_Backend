import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { teamController } from "./team.controller";

export const teamRoutes = Router();

teamRoutes.post("/", auth(Role.OWNER, Role.ADMIN), teamController.create);
teamRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), teamController.list);
teamRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), teamController.get);
teamRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN), teamController.update);
teamRoutes.get(
  "/:id/members",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  teamController.members,
);
teamRoutes.post("/:id/members", auth(Role.OWNER, Role.ADMIN), teamController.addMember);
