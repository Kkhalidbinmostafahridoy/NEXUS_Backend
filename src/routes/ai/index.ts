import { Role } from "@prisma/client";
import { Router } from "express";

import { aiController } from "../../app/modules/ai/ai.controller";
import { auth } from "../../middlewares/auth";

export const aiRoutes = Router();

aiRoutes.post("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER), aiController.create);
aiRoutes.get("/", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), aiController.list);
aiRoutes.get("/:id", auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER), aiController.get);

export default aiRoutes;
