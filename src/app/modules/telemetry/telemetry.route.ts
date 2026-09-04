import { Request, Response, Router } from "express";

import { Role } from "@prisma/client";

import { ApiKeyRequest, apiKey } from "../../../middlewares/apiKey";
import { auth, AuthRequest } from "../../../middlewares/auth";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";
import { TelemetryKind, telemetryService } from "./telemetry.service";

export const telemetryRoutes = Router();
export const ingestRoutes = Router();

const kinds = ["logs", "metrics", "traces"] as const;

const validatedItems = (value: unknown) => {
  const items = Array.isArray(value) ? value : [value];
  if (
    !items.length ||
    items.some(
      (item) =>
        !item ||
        typeof item !== "object" ||
        typeof (item as Record<string, unknown>).serviceId !== "string",
    )
  ) {
    throw Object.assign(new Error("Each telemetry event requires a string serviceId."), {
      statusCode: 400,
    });
  }
  return items as Record<string, unknown>[];
};

for (const kind of kinds) {
  ingestRoutes.post(
    `/${kind}`,
    apiKey,
    catchAsync(async (req: ApiKeyRequest, res: Response) => {
      const items = validatedItems(req.body);
      if (!req.apiKey) throw Object.assign(new Error("API key is required."), { statusCode: 401 });
      const result = await telemetryService.ingest(kind, items, req.apiKey);
      return sendResponse(res, 202, `${kind} accepted`, result);
    }),
  );

  ingestRoutes.post(
    `/${kind}/batch`,
    apiKey,
    catchAsync(async (req: ApiKeyRequest, res: Response) => {
      const items = validatedItems(req.body?.items);
      if (!req.apiKey) throw Object.assign(new Error("API key is required."), { statusCode: 401 });
      const result = await telemetryService.ingest(kind, items, req.apiKey);
      return sendResponse(res, 202, `${kind} batch accepted`, result);
    }),
  );

  telemetryRoutes.get(
    `/${kind}`,
    auth(Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER),
    catchAsync(async (req: AuthRequest, res) =>
      sendResponse(
        res,
        200,
        `${kind} retrieved`,
        await telemetryService.list(
          kind as TelemetryKind,
          req.user!.organizationId,
          String(req.query.serviceId ?? "") || undefined,
        ),
      ),
    ),
  );
}
