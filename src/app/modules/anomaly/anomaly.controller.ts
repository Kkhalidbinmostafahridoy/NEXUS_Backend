import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { anomalyService } from "./anomaly.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

export const anomalyController = {
  list: catchAsync(async (request: AuthRequest, response) => {
    const anomalies = await anomalyService.list(organizationId(request));

    sendResponse(response, 200, "Anomalies retrieved", anomalies);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const anomaly = await anomalyService.get(String(request.params.id), organizationId(request));

    sendResponse(response, 200, "Anomaly retrieved", anomaly);
  }),
};
