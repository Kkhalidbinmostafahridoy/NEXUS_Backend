import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { incidentController } from "./incident.controller";

export const incidentRoutes = Router();

incidentRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), incidentController.create);

incidentRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  incidentController.list,
);

incidentRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  incidentController.get,
);

incidentRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), incidentController.update);

incidentRoutes.post(
  "/:id/acknowledge",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.acknowledge,
);

incidentRoutes.post(
  "/:id/investigate",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.investigate,
);

incidentRoutes.post(
  "/:id/mitigate",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.mitigate,
);

incidentRoutes.post(
  "/:id/resolve",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.resolve,
);

incidentRoutes.post(
  "/:id/reopen",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.reopen,
);

incidentRoutes.post(
  "/:id/assign",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.assign,
);

incidentRoutes.get(
  "/:id/timeline",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  incidentController.timeline,
);

incidentRoutes.post(
  "/:id/timeline",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  incidentController.addTimeline,
);
