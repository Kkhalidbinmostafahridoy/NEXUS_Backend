import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { documentController } from "./document.controller";

export const documentRoutes = Router();

documentRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), documentController.create);
documentRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  documentController.list,
);
documentRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  documentController.get,
);
documentRoutes.patch("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), documentController.update);
