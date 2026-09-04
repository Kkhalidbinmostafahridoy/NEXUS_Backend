import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { incidentService as s } from "./incident.service";
export const incidentController = {
  create: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Incident created", await s.create(q.body)),
  ),
  list: catchAsync(async (_q, r) => sendResponse(r, 200, "Incidents retrieved", await s.list())),
  get: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Incident retrieved", await s.get(String(q.params.id))),
  ),
  update: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Incident updated", await s.update(String(q.params.id), q.body)),
  ),
  acknowledge: catchAsync(async (q, r) =>
    sendResponse(
      r,
      200,
      "Incident acknowledged",
      await s.transition(String(q.params.id), "ACKNOWLEDGED"),
    ),
  ),
  resolve: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Incident resolved", await s.transition(String(q.params.id), "RESOLVED")),
  ),
  timeline: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Timeline retrieved", await s.timeline(String(q.params.id))),
  ),
};
