import { RequestHandler } from "express";
import { httpStatus } from "../constants/httpStatus";
export const notFound: RequestHandler = (_req, res) =>
  res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Route not found" });
