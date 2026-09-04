import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { chaosController } from "./chaos.controller";

export const chaosRoutes = Router();

chaosRoutes.post("/experiments", auth(Role.OWNER, Role.ADMIN), chaosController.create);
chaosRoutes.get(
  "/experiments",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  chaosController.list,
);
chaosRoutes.get(
  "/experiments/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  chaosController.get,
);
chaosRoutes.post("/experiments/:id/start", auth(Role.OWNER, Role.ADMIN), chaosController.start);
chaosRoutes.post("/experiments/:id/stop", auth(Role.OWNER, Role.ADMIN), chaosController.stop);
