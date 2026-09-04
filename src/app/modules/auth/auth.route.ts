import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../../middlewares/auth";
import { rateLimiter } from "../../../middlewares/rateLimiter";
import { validateRequest } from "../../../middlewares/validateRequest";

import { authValidation } from "./auth.validation";
export const authRoutes = Router();
authRoutes.post(
  "/register",
  rateLimiter(10),
  validateRequest(authValidation.register),
  authController.register,
);
authRoutes.post(
  "/login",
  rateLimiter(10),
  validateRequest(authValidation.login),
  authController.login,
);
authRoutes.post(
  "/refresh",
  rateLimiter(20),
  validateRequest(authValidation.refresh),
  authController.refresh,
);
authRoutes.post("/logout", auth(), authController.logout);
authRoutes.get("/me", auth(), authController.me);
