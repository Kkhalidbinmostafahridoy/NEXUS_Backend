import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { authService } from "./auth.service";
import { AuthRequest } from "../../../middlewares/auth";
export const authController = {
  register: catchAsync(async (q, r) =>
    sendResponse(r, 201, "Registration successful", await authService.register(q.body)),
  ),
  login: catchAsync(async (q, r) =>
    sendResponse(r, 200, "Login successful", await authService.login(q.body)),
  ),
  refresh: catchAsync(async (q, r) =>
    sendResponse(
      r,
      200,
      "Tokens refreshed",
      await authService.refresh(String(q.body.refreshToken)),
    ),
  ),
  logout: catchAsync(async (q: AuthRequest, r) => {
    await authService.logout(q.user!.sub);
    return sendResponse(r, 200, "Logged out");
  }),
  me: catchAsync(async (q: AuthRequest, r) =>
    sendResponse(
      r,
      200,
      "Current user retrieved",
      await authService.me(q.user!.sub, q.user!.organizationId),
    ),
  ),
};
