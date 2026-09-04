import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { sloService } from "./slo.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const sloController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "SLO created",
      await sloService.create(organizationId(request), request.body),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 200, "SLOs retrieved", await sloService.list(organizationId(request)));
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "SLO retrieved",
      await sloService.get(String(request.params.id), organizationId(request)),
    );
  }),
  update: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "SLO updated",
      await sloService.update(String(request.params.id), organizationId(request), request.body),
    );
  }),
  measurements: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "SLO measurements retrieved",
      await sloService.measurements(String(request.params.id), organizationId(request)),
    );
  }),
  addMeasurement: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "SLO measurement created",
      await sloService.addMeasurement(
        String(request.params.id),
        organizationId(request),
        request.body,
      ),
    );
  }),
};
