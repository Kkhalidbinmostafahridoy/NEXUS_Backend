import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { organizationService as s } from "./organization.service";
export const organizationController = {
  create: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Organization created", await s.create(q.body)),
  ),
  list: catchAsync(async (_q, r) =>
    sendResponse(r, 200, "Organizations retrieved", await s.list()),
  ),
  get: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Organization retrieved", await s.get(String(q.params.id))),
  ),
  update: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Organization updated", await s.update(String(q.params.id), q.body)),
  ),
  remove: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Organization deleted", await s.remove(String(q.params.id))),
  ),
  members: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Members retrieved", await s.members(String(q.params.id))),
  ),
  addMember: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Member added", await s.addMember(String(q.params.id), q.body)),
  ),
};
