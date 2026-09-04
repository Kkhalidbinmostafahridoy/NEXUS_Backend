import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../../middlewares/auth";
import { serviceController as c } from "./service.controller";
export const serviceRoutes = Router();
serviceRoutes.post("/", auth(Role.OWNER, Role.ADMIN), c.create);
serviceRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.list);
serviceRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.get);
serviceRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN), c.update);
serviceRoutes.delete("/:id", auth(Role.OWNER, Role.ADMIN), c.remove);
serviceRoutes.get(
  "/:id/dependencies",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  c.dependencies,
);
serviceRoutes.post("/:id/dependencies", auth(Role.OWNER, Role.ADMIN), c.addDependency);
serviceRoutes.post("/:id/api-keys", auth(Role.OWNER, Role.ADMIN), c.createApiKey);
