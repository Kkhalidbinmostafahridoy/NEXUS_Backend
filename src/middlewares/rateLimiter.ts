import { RequestHandler } from "express";

type Counter = { count: number; resetAt: number };
const counters = new Map<string, Counter>();

export const rateLimiter =
  (max = 30, windowMs = 60_000): RequestHandler =>
  (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}:${req.path}`;
    const now = Date.now();
    const counter = counters.get(key);

    if (!counter || counter.resetAt <= now) {
      counters.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (counter.count >= max) {
      return res
        .status(429)
        .json({ success: false, message: "Too many requests. Please try again later." });
    }

    counter.count += 1;
    return next();
  };
