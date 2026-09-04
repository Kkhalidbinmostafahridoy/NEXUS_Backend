import { createCrud } from "../crud";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { serviceService } from "./service.service";
const crud = createCrud("service", "Service");
export const serviceController = {
  ...crud,
  dependencies: catchAsync(async (q, r) =>
    sendResponse(
      r,
      200,
      "Dependencies retrieved",
      await serviceService.dependencies(String(q.params.id)),
    ),
  ),
  addDependency: catchAsync(async (q, r) =>
    sendResponse(
      r,
      201,
      "Dependency created",
      await serviceService.addDependency(String(q.params.id), q.body),
    ),
  ),
};
