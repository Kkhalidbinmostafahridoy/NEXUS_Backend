import express from "express";
import cors from "cors";
import helmet from "helmet";

import { addNexusApiPaths } from "./config/openapi";
import { apiRoutes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { auditLog } from "./middlewares/auditLog";
import { notFound } from "./middlewares/notFound";
import { strictRequestBody } from "./middlewares/strictRequestBody";
const app = express();
const openApiDocument = addNexusApiPaths({
  openapi: "3.0.0",
  info: {
    title: "NEXUS API",
    version: "1.0.0",
  },
  paths: {},
});

app.use(helmet());
app.use(cors({ origin: process.env.NEXT_PUBLIC_WEB_URL?.split(",") ?? true, credentials: true }));
app.use(express.json({ limit: "1mb", strict: true }));
app.use(strictRequestBody);
app.get("/", (_request, response) =>
  response.json({
    status: "ok",
    service: "NEXUS API",
    health: "/health",
    openApi: "/openapi.json",
    basePath: "/api/v1",
  }),
);
app.get("/health", (_q, r) => r.json({ status: "ok" }));
app.get("/openapi.json", (_q, r) => r.json(openApiDocument));
app.use(auditLog);
app.use("/api/v1", apiRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
