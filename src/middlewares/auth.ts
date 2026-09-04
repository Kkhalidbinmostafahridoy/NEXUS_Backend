import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Role } from "@prisma/client";

import { prisma } from "../shared/prisma";

export type AuthRequest = Request & {
  user?: { sub: string; role: Role; organizationId: string };
};

export const auth =
  (...roles: Role[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET!,
      ) as { sub: string; organizationId: string };
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId: payload.organizationId, userId: payload.sub },
        },
      });
      if (!user || user.status !== "ACTIVE" || !membership)
        return res.status(401).json({ success: false, message: "Session is no longer valid" });
      if (roles.length && !roles.includes(membership.role))
        return res.status(403).json({ success: false, message: "Forbidden" });
      req.user = { sub: user.id, role: membership.role, organizationId: membership.organizationId };
      return next();
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired access token" });
    }
  };
