import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { authService } from "./auth.service";
export const authController = {
  register: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Registration successful", await authService.register(q.body)),
  ),
  login: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Login successful", await authService.login(q.body)),
  ),
};
