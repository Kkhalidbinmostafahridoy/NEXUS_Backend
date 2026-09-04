import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { documentService } from "./document.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const documentController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 201, "Document created", await documentService.create(organizationId(request), request.body));
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 200, "Documents retrieved", await documentService.list(organizationId(request)));
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 200, "Document retrieved", await documentService.get(String(request.params.id), organizationId(request)));
  }),
  update: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 200, "Document updated", await documentService.update(String(request.params.id), organizationId(request), request.body));
  }),
};
