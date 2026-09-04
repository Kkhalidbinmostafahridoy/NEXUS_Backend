import { Role } from "@prisma/client";
import { Router } from "express";

import { auth } from "../../../middlewares/auth";
import { postmortemController } from "./postmortem.controller";

export const postmortemRoutes = Router();

postmortemRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), postmortemController.create);
postmortemRoutes.get(
  "/",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  postmortemController.list,
);
postmortemRoutes.get(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
  postmortemController.get,
);
postmortemRoutes.patch(
  "/:id",
  auth(Role.OWNER, Role.ADMIN, Role.MEMBER),
  postmortemController.update,
);
