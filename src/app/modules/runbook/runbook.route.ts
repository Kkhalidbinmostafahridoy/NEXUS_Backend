import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { runbookController } from "./runbook.controller";

export const runbookRoutes = Router();

runbookRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), runbookController.create);
runbookRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  runbookController.list,
);
runbookRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  runbookController.get,
);
runbookRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), runbookController.update);
