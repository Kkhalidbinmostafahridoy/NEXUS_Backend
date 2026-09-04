import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
export type AuthRequest = Request & { user?: { sub: string; role: Role } };
export const auth =
  (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: Role };
      if (roles.length && !roles.includes(user.role))
        return res.status(403).json({ success: false, message: "Forbidden" });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
