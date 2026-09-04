import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../../middlewares/auth";
import { organizationController as c } from "./organization.controller";
export const organizationRoutes = Router();
organizationRoutes.post("/", auth(Role.OWNER, Role.ADMIN), c.create);
organizationRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.list);
organizationRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.get);
organizationRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN), c.update);
organizationRoutes.delete("/:id", auth(Role.OWNER), c.remove);
organizationRoutes.get(
  "/:id/members",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  c.members,
);
organizationRoutes.post("/:id/members", auth(Role.OWNER, Role.ADMIN), c.addMember);
