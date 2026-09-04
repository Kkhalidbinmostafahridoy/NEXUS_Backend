import { ErrorRequestHandler } from "express";
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.code === "P2025" ? 404 : 500;
  res.status(status).json({
    success: false,
    message: status === 404 ? "Resource not found" : "Internal server error",
  });
};
