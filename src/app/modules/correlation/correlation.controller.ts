import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { correlationService } from "./correlation.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const correlationController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "Correlation created",
      await correlationService.create(organizationId(request), request.body),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Correlations retrieved",
      await correlationService.list(organizationId(request)),
    );
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Correlation retrieved",
      await correlationService.get(String(request.params.id), organizationId(request)),
    );
  }),
};
