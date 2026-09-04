import { ErrorRequestHandler } from "express";

type ApiError = Error & {
  code?: string;
  statusCode?: number;
  details?: unknown;
};

export const errorHandler: ErrorRequestHandler = (receivedError, _request, response, _next) => {
  const error = receivedError as ApiError;
  const status = error.statusCode ?? (error.code === "P2025" ? 404 : 500);

  const body: Record<string, unknown> = {
    success: false,
    message:
      status === 500
        ? "Internal server error"
        : error.message || "The request could not be completed.",
  };

  if (error.details) {
    body.details = error.details;
  }

  response.status(status).json(body);
};
