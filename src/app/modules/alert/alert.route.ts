import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { alertController } from "./alert.controller";

export const alertRoutes = Router();

alertRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), alertController.list);

alertRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  alertController.get,
);

alertRoutes.post(
  "/:id/acknowledge",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  alertController.acknowledge,
);

alertRoutes.post(
  "/:id/resolve",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  alertController.resolve,
);
