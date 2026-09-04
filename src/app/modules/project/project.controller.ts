import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";

import { projectService } from "./project.service";

export const projectController = {
  create: catchAsync(async (req: AuthRequest, res) =>
    sendResponse(
      res,
      201,
      "Project created",
      await projectService.create({ ...req.body, organizationId: req.user!.organizationId }),
    ),
  ),
  list: catchAsync(async (req: AuthRequest, res) =>
    sendResponse(
      res,
      200,
      "Projects retrieved",
      await projectService.list(req.user!.organizationId),
    ),
  ),
  get: catchAsync(async (req: AuthRequest, res) =>
    sendResponse(
      res,
      200,
      "Project retrieved",
      await projectService.get(String(req.params.id), req.user!.organizationId),
    ),
  ),
  update: catchAsync(async (req: AuthRequest, res) =>
    sendResponse(
      res,
      200,
      "Project updated",
      await projectService.update(String(req.params.id), req.user!.organizationId, req.body),
    ),
  ),
  remove: catchAsync(async (req: AuthRequest, res) =>
    sendResponse(
      res,
      200,
      "Project deleted",
      await projectService.remove(String(req.params.id), req.user!.organizationId),
    ),
  ),
};
