import { Request, Response, Router } from "express";

import { Role } from "@prisma/client";

import { apiKey } from "../../../middlewares/apiKey";
import { auth } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { TelemetryKind, telemetryService } from "./telemetry.service";

export const telemetryRoutes = Router();
export const ingestRoutes = Router();

const kinds = ["logs", "metrics", "traces"] as const;

for (const kind of kinds) {
  ingestRoutes.post(
    `/${kind}`,
    apiKey,
    catchAsync(async (req: Request, res: Response) => {
      const items = Array.isArray(req.body) ? req.body : [req.body];
      const result = await telemetryService.ingest(kind, items);
      return sendResponse(res, 202, `${kind} accepted`, result);
    }),
  );

  ingestRoutes.post(
    `/${kind}/batch`,
    apiKey,
    catchAsync(async (req: Request, res: Response) => {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const result = await telemetryService.ingest(kind, items);
      return sendResponse(res, 202, `${kind} batch accepted`, result);
    }),
  );

  telemetryRoutes.get(
    `/${kind}`,
    auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
    (req, res) =>
      sendResponse(
        res,
        200,
        `${kind} retrieved`,
        telemetryService.list(
          kind as TelemetryKind,
          String(req.query.serviceId ?? "") || undefined,
        ),
      ),
  );
}
