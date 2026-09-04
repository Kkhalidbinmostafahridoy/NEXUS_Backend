import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { alertRuleService as s } from "./alertRule.service";
export const alertRuleController = {
  create: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Alert rule created", await s.create(q.body)),
  ),
  list: catchAsync(async (_q, r) => sendResponse(r, 200, "Alert rules retrieved", await s.list())),
  update: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Alert rule updated", await s.update(String(q.params.id), q.body)),
  ),
  enable: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Alert rule enabled", await s.setEnabled(String(q.params.id), true)),
  ),
  disable: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Alert rule disabled", await s.setEnabled(String(q.params.id), false)),
  ),
};
