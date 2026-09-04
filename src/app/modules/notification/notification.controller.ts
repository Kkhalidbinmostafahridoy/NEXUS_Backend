import { AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { notificationService } from "./notification.service";

const userId = (request: AuthRequest) => {
  if (!request.user?.sub) {
    throw Object.assign(new Error("Authentication is required."), { statusCode: 401 });
  }
  return request.user.sub;
};

export const notificationController = {
  list: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Notifications retrieved",
      await notificationService.list(userId(request)),
    );
  }),
  markRead: catchAsync(async (request: AuthRequest, response) => {
    sendResponse(
      response,
      200,
      "Notification marked as read",
      await notificationService.markRead(String(request.params.id), userId(request)),
    );
  }),
};
