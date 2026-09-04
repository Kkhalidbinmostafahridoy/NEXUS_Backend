import { Role } from "@prisma/client";

import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { organizationService } from "./organization.service";

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

export const organizationController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const { userId } = context(request);
    const organization = await organizationService.create(userId, String(request.body.name || ""));

    sendResponse(response, 201, "Organization created", organization);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const { userId } = context(request);
    const organizations = await organizationService.list(userId);

    sendResponse(response, 200, "Organizations retrieved", organizations);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const { organizationId } = context(request);
    const organization = await organizationService.get(String(request.params.id), organizationId);

    sendResponse(response, 200, "Organization retrieved", organization);
  }),

  update: catchAsync(async (request: AuthRequest, response) => {
    const { organizationId } = context(request);
    const organization = await organizationService.update(
      String(request.params.id),
      organizationId,
      String(request.body.name || ""),
    );

    sendResponse(response, 200, "Organization updated", organization);
  }),

  members: catchAsync(async (request: AuthRequest, response) => {
    const { organizationId } = context(request);
    await organizationService.get(String(request.params.id), organizationId);

    sendResponse(
      response,
      200,
      "Members retrieved",
      await organizationService.members(organizationId),
    );
  }),

  addMember: catchAsync(async (request: AuthRequest, response) => {
    const { organizationId } = context(request);
    await organizationService.get(String(request.params.id), organizationId);
    const role =
      Object.values(Role).includes(request.body.role) && request.body.role !== Role.OWNER
        ? request.body.role
        : Role.MEMBER;
    const member = await organizationService.addMember(
      organizationId,
      String(request.body.userId || ""),
      role,
    );

    sendResponse(response, 201, "Member added", member);
  }),
};
