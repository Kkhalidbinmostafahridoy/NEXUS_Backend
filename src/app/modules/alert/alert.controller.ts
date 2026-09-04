import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { alertService } from "./alert.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

export const alertController = {
  list: catchAsync(async (request: AuthRequest, response) => {
    const alerts = await alertService.list(organizationId(request));

    sendResponse(response, 200, "Alerts retrieved", alerts);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const alert = await alertService.get(String(request.params.id), organizationId(request));

    sendResponse(response, 200, "Alert retrieved", alert);
  }),

  acknowledge: catchAsync(async (request: AuthRequest, response) => {
    const alert = await alertService.acknowledge(
      String(request.params.id),
      organizationId(request),
    );

    sendResponse(response, 200, "Alert acknowledged", alert);
  }),

  resolve: catchAsync(async (request: AuthRequest, response) => {
    const alert = await alertService.resolve(String(request.params.id), organizationId(request));

    sendResponse(response, 200, "Alert resolved", alert);
  }),
};
