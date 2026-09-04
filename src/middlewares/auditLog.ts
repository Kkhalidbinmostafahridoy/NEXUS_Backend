import { NextFunction, Response } from "express";

import { prisma } from "../shared/prisma";
import { AuthRequest } from "./auth";

const mutationMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export const auditLog = (req: AuthRequest, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    if (!req.user || !mutationMethods.has(req.method) || res.statusCode >= 400) return;

    const resource = req.baseUrl.split("/").filter(Boolean).at(-1) ?? "unknown";
    void prisma.auditLog
      .create({
        data: {
          userId: req.user.sub,
          action: `${resource.toUpperCase().replace(/-/g, "_")}_${req.method}`,
          resource,
          resourceId: typeof req.params.id === "string" ? req.params.id : undefined,
          metadata: {
            method: req.method,
            path: req.originalUrl,
            organizationId: req.user.organizationId,
          },
        },
      })
      .catch(() => undefined);
  });

  next();
};
