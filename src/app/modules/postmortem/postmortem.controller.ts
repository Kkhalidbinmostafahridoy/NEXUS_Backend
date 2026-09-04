import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { postmortemService } from "./postmortem.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const postmortemController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "Postmortem created",
      await postmortemService.create(organizationId(request), request.body),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Postmortems retrieved",
      await postmortemService.list(organizationId(request)),
    );
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Postmortem retrieved",
      await postmortemService.get(String(request.params.id), organizationId(request)),
    );
  }),
  update: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Postmortem updated",
      await postmortemService.update(
        String(request.params.id),
        organizationId(request),
        request.body,
      ),
    );
  }),
};
