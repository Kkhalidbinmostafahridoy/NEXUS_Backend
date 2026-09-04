import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { aiService } from "./ai.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const aiController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "AI investigation queued",
      await aiService.create(organizationId(request), request.body),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "AI investigations retrieved",
      await aiService.list(organizationId(request)),
    );
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "AI investigation retrieved",
      await aiService.get(String(request.params.id), organizationId(request)),
    );
  }),
};
