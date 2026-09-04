import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { runbookService } from "./runbook.service";

const context = (request: AuthRequest) => {
  if (!request.user?.organizationId || !request.user.sub) {
    throw Object.assign(new Error("Authentication and an active organization are required."), {
      statusCode: 403,
    });
  }

  return {
    organizationId: request.user.organizationId,
    userId: request.user.sub,
  };
};

export const runbookController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const current = context(request);
    const runbook = await runbookService.create(
      current.organizationId,
      current.userId,
      request.body,
    );

    sendResponse(response, 201, "Runbook created", runbook);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const current = context(request);
    const runbooks = await runbookService.list(current.organizationId, current.userId);

    sendResponse(response, 200, "Runbooks retrieved", runbooks);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const current = context(request);
    const runbook = await runbookService.get(
      String(request.params.id),
      current.organizationId,
      current.userId,
    );

    sendResponse(response, 200, "Runbook retrieved", runbook);
  }),

  update: catchAsync(async (request: AuthRequest, response) => {
    const current = context(request);
    const runbook = await runbookService.update(
      String(request.params.id),
      current.organizationId,
      current.userId,
      request.body,
    );

    sendResponse(response, 200, "Runbook updated", runbook);
  }),
};
