import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { teamService } from "./team.service";

const organizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), { statusCode: 403 });
  }
  return request.user.organizationId;
};

export const teamController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "Team created",
      await teamService.create(organizationId(request), String(request.body.name || "")),
    );
  }),
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(response, 200, "Teams retrieved", await teamService.list(organizationId(request)));
  }),
  get: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Team retrieved",
      await teamService.get(String(request.params.id), organizationId(request)),
    );
  }),
  update: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Team updated",
      await teamService.update(
        String(request.params.id),
        organizationId(request),
        String(request.body.name || ""),
      ),
    );
  }),
  members: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Team members retrieved",
      await teamService.members(String(request.params.id), organizationId(request)),
    );
  }),
  addMember: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      201,
      "Team member added",
      await teamService.addMember(
        String(request.params.id),
        organizationId(request),
        String(request.body.userId || ""),
      ),
    );
  }),
};
