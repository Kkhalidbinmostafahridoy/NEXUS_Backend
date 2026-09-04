import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { alertRuleService } from "./alertRule.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

export const alertRuleController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const rule = await alertRuleService.create(organizationId(request), request.body);

    sendResponse(response, 201, "Alert rule created", rule);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const rules = await alertRuleService.list(organizationId(request));

    sendResponse(response, 200, "Alert rules retrieved", rules);
  }),

  update: catchAsync(async (request: AuthRequest, response) => {
    const rule = await alertRuleService.update(
      String(request.params.id),
      organizationId(request),
      request.body,
    );

    sendResponse(response, 200, "Alert rule updated", rule);
  }),

  enable: catchAsync(async (request: AuthRequest, response) => {
    const rule = await alertRuleService.setEnabled(
      String(request.params.id),
      organizationId(request),
      true,
    );

    sendResponse(response, 200, "Alert rule enabled", rule);
  }),

  disable: catchAsync(async (request: AuthRequest, response) => {
    const rule = await alertRuleService.setEnabled(
      String(request.params.id),
      organizationId(request),
      false,
    );

    sendResponse(response, 200, "Alert rule disabled", rule);
  }),
};
