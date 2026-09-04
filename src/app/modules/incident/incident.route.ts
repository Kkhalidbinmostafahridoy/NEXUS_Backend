import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../../middlewares/auth";
import { incidentController as c } from "./incident.controller";
export const incidentRoutes = Router();
incidentRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), c.create);
incidentRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.list);
incidentRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), c.get);
incidentRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), c.update);
incidentRoutes.post("/:id/acknowledge", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), c.acknowledge);
incidentRoutes.post("/:id/resolve", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), c.resolve);
incidentRoutes.get(
  "/:id/timeline",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  c.timeline,
);
