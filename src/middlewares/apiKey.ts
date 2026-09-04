import argon2 from "argon2";
import { NextFunction, Request, Response } from "express";

import { prisma } from "../shared/prisma";

export type ApiKeyRequest = Request & {
  apiKey?: {
    id: string;
    organizationId: string;
    serviceId: string | null;
  };
};

export const apiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  const secret = req.header("x-nexus-api-key");

  if (!secret?.startsWith("nx_live_")) {
    return res.status(401).json({ success: false, message: "X-NEXUS-API-KEY is required" });
  }

  const candidates = await prisma.apiKey.findMany({
    where: { prefix: secret.slice(0, 16), revokedAt: null },
  });
  const matches = await Promise.all(
    candidates.map(async (candidate) =>
      (await argon2.verify(candidate.keyHash, secret)) ? candidate : null,
    ),
  );
  const key = matches.find(Boolean);

  if (!key) return res.status(401).json({ success: false, message: "Invalid API key" });

  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  req.apiKey = {
    id: key.id,
    organizationId: key.organizationId,
    serviceId: key.serviceId,
  };
  return next();
};
