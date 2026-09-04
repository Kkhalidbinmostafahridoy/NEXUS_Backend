import { NextFunction, Request, Response } from "express";

const writeMethods = new Set(["POST", "PUT", "PATCH"]);

export const strictRequestBody = (request: Request, response: Response, next: NextFunction) => {
  if (!writeMethods.has(request.method) || !request.path.startsWith("/api/v1")) {
    return next();
  }

  const isArrayPayload = Array.isArray(request.body);
  const isObjectPayload =
    request.body !== null && typeof request.body === "object" && !isArrayPayload;

  if (!isArrayPayload && !isObjectPayload) {
    return response.status(400).json({
      success: false,
      message: "Request body must be a JSON object or array.",
    });
  }

  return next();
};
