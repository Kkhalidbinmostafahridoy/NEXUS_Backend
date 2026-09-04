import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { deploymentService } from "./deployment.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

export const deploymentController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const deployment = await deploymentService.create(organizationId(request), request.body);

    sendResponse(response, 201, "Deployment created", deployment);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const deployments = await deploymentService.list(organizationId(request));

    sendResponse(response, 200, "Deployments retrieved", deployments);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const deployment = await deploymentService.get(
      String(request.params.id),
      organizationId(request),
    );

    sendResponse(response, 200, "Deployment retrieved", deployment);
  }),
};
