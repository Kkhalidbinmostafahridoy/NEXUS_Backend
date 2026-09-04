import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { serviceService } from "./service.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

export const serviceController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const service = await serviceService.create(organizationId(request), request.body);

    sendResponse(response, 201, "Service created", service);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const services = await serviceService.list(organizationId(request));

    sendResponse(response, 200, "Services retrieved", services);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const service = await serviceService.get(String(request.params.id), organizationId(request));

    sendResponse(response, 200, "Service retrieved", service);
  }),

  update: catchAsync(async (request: AuthRequest, response) => {
    const service = await serviceService.update(
      String(request.params.id),
      organizationId(request),
      request.body,
    );

    sendResponse(response, 200, "Service updated", service);
  }),

  remove: catchAsync(async (request: AuthRequest, response) => {
    await serviceService.remove(String(request.params.id), organizationId(request));

    sendResponse(response, 200, "Service deleted");
  }),

  dependencies: catchAsync(async (request: AuthRequest, response) => {
    const dependencies = await serviceService.dependencies(
      String(request.params.id),
      organizationId(request),
    );

    sendResponse(response, 200, "Dependencies retrieved", dependencies);
  }),

  addDependency: catchAsync(async (request: AuthRequest, response) => {
    const dependency = await serviceService.addDependency(
      String(request.params.id),
      organizationId(request),
      request.body,
    );

    sendResponse(response, 201, "Dependency created", dependency);
  }),

  createApiKey: catchAsync(async (request: AuthRequest, response) => {
    const key = await serviceService.createApiKey(
      String(request.params.id),
      organizationId(request),
      String(request.body.name || "SDK key"),
    );

    sendResponse(
      response,
      201,
      "API key created. Copy it now; it will not be returned again.",
      key,
    );
  }),
};
