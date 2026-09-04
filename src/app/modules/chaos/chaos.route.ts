import { Router } from "express";

import { Role } from "@prisma/client";

import { auth } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { prisma } from "../../../shared/prisma";

export const chaosRoutes = Router();

chaosRoutes.get(
  "/experiments",
  auth(Role.OWNER, Role.ADMIN),
  catchAsync(async (_req, res) =>
    sendResponse(
      res,
      200,
      "Experiments retrieved",
      await prisma.chaosExperiment.findMany({ orderBy: { createdAt: "desc" } }),
    ),
  ),
);
chaosRoutes.post(
  "/experiments",
  auth(Role.OWNER, Role.ADMIN),
  catchAsync(async (req, res) =>
    sendResponse(
      res,
      201,
      "Experiment created",
      await prisma.chaosExperiment.create({ data: req.body }),
    ),
  ),
);
chaosRoutes.post(
  "/experiments/:id/start",
  auth(Role.OWNER, Role.ADMIN),
  catchAsync(async (req, res) =>
    sendResponse(
      res,
      200,
      "Experiment started",
      await prisma.chaosExperiment.update({
        where: { id: String(req.params.id) },
        data: { status: "RUNNING", startedAt: new Date() },
      }),
    ),
  ),
);
chaosRoutes.post(
  "/experiments/:id/stop",
  auth(Role.OWNER, Role.ADMIN),
  catchAsync(async (req, res) =>
    sendResponse(
      res,
      200,
      "Experiment stopped",
      await prisma.chaosExperiment.update({
        where: { id: String(req.params.id) },
        data: { status: "STOPPED", stoppedAt: new Date() },
      }),
    ),
  ),
);
