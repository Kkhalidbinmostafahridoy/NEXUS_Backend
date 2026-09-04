import { IncidentStatus } from "@prisma/client";

import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { incidentService } from "./incident.service";

const activeOrganizationId = (request: AuthRequest) => {
  if (!request.user?.organizationId) {
    throw Object.assign(new Error("An active organization is required."), {
      statusCode: 403,
    });
  }

  return request.user.organizationId;
};

const actorId = (request: AuthRequest) => {
  if (!request.user?.sub) {
    throw Object.assign(new Error("Authentication is required."), {
      statusCode: 401,
    });
  }

  return request.user.sub;
};

export const incidentController = {
  create: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.create(
      activeOrganizationId(request),
      actorId(request),
      request.body,
    );

    sendResponse(response, 201, "Incident created", incident);
  }),

  list: catchAsync(async (request: AuthRequest, response) => {
    const incidents = await incidentService.list(activeOrganizationId(request));

    sendResponse(response, 200, "Incidents retrieved", incidents);
  }),

  get: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.get(
      String(request.params.id),
      activeOrganizationId(request),
    );

    sendResponse(response, 200, "Incident retrieved", incident);
  }),

  update: catchAsync(async (request: AuthRequest, response) => {
    const { status: _status, assigneeId: _assigneeId, ...details } = request.body;
    const incident = await incidentService.update(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      details,
    );

    sendResponse(response, 200, "Incident updated", incident);
  }),

  acknowledge: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.transition(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      IncidentStatus.ACKNOWLEDGED,
    );

    sendResponse(response, 200, "Incident acknowledged", incident);
  }),

  investigate: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.transition(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      IncidentStatus.INVESTIGATING,
    );

    sendResponse(response, 200, "Incident investigation started", incident);
  }),

  mitigate: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.transition(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      IncidentStatus.MITIGATING,
    );

    sendResponse(response, 200, "Incident mitigation started", incident);
  }),

  resolve: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.transition(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      IncidentStatus.RESOLVED,
    );

    sendResponse(response, 200, "Incident resolved", incident);
  }),

  reopen: catchAsync(async (request: AuthRequest, response) => {
    const incident = await incidentService.transition(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      IncidentStatus.OPEN,
    );

    sendResponse(response, 200, "Incident reopened", incident);
  }),

  assign: catchAsync(async (request: AuthRequest, response) => {
    const assigneeId =
      request.body.assigneeId === null ? null : String(request.body.assigneeId || "");
    const incident = await incidentService.assign(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      assigneeId || null,
    );

    sendResponse(response, 200, "Incident assignee updated", incident);
  }),

  timeline: catchAsync(async (request: AuthRequest, response) => {
    const events = await incidentService.timeline(
      String(request.params.id),
      activeOrganizationId(request),
    );

    sendResponse(response, 200, "Timeline retrieved", events);
  }),

  addTimeline: catchAsync(async (request: AuthRequest, response) => {
    const event = await incidentService.addTimeline(
      String(request.params.id),
      activeOrganizationId(request),
      actorId(request),
      String(request.body.type || "NOTE_ADDED"),
      String(request.body.message || ""),
      request.body.metadata,
    );

    sendResponse(response, 201, "Timeline event added", event);
  }),
};
