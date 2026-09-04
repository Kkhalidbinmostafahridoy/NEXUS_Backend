import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { chaosService } from "./chaos.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const chaosController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "Experiment created",
      await chaosService.create(organizationId(request), request.body),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Experiments retrieved",
      await chaosService.list(organizationId(request)),
    );
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Experiment retrieved",
      await chaosService.get(String(request.params.id), organizationId(request)),
    );
  }),
  start: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Experiment started",
      await chaosService.start(String(request.params.id), organizationId(request)),
    );
  }),
  stop: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Experiment stopped",
      await chaosService.stop(String(request.params.id), organizationId(request)),
    );
  }),
};
