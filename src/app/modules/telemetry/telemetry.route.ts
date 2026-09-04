import { Request, Response, Router } from "express";

import { Role } from "@prisma/client";

import { apiKey } from "../../../middlewares/apiKey";
import { auth } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";

export const telemetryRoutes = Router();
export const ingestRoutes = Router();

const memoryStore: Record<string, unknown[]> = { logs: [], metrics: [], traces: [] };
const kinds = ["logs", "metrics", "traces"] as const;

for (const kind of kinds) {
  ingestRoutes.post(
    `/${kind}`,
    apiKey,
    catchAsync(async (req: Request, res: Response) => {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      memoryStore[kind].push(...items);
      return sendResponse(res, 202, `${kind} accepted`, { accepted: items.length });
    }),
  );

  ingestRoutes.post(
    `/${kind}/batch`,
    apiKey,
    catchAsync(async (req: Request, res: Response) => {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      memoryStore[kind].push(...items);
      return sendResponse(res, 202, `${kind} batch accepted`, { accepted: items.length });
    }),
  );

  telemetryRoutes.get(
    `/${kind}`,
    auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
    (_req, res) => sendResponse(res, 200, `${kind} retrieved`, memoryStore[kind]),
  );
}
