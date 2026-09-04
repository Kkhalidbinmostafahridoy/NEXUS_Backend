import { NextFunction, Request, Response } from "express";
export const apiKey = (req: Request, res: Response, next: NextFunction) => {
  if (!req.header("x-nexus-api-key")?.startsWith("nx_live_"))
    return res.status(401).json({ success: false, message: "X-NEXUS-API-KEY is required" });
  next();
};
