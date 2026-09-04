import { Router } from "express";

import aiRoutes from "./ai";
import alertRoutes from "./alert";
import alertRuleRoutes from "./alertRule";
import anomalyRoutes from "./anomaly";
import auditLogRoutes from "./auditLog";
import authRoutes from "./auth";
import chaosRoutes from "./chaos";
import correlationRoutes from "./correlation";
import deploymentRoutes from "./deployment";
import documentRoutes from "./document";
import incidentRoutes from "./incident";
import notificationRoutes from "./notification";
import organizationRoutes from "./organization";
import postmortemRoutes from "./postmortem";
import projectRoutes from "./project";
import runbookRoutes from "./runbook";
import serviceRoutes from "./service";
import sloRoutes from "./slo";
import teamRoutes from "./team";
import telemetryRoutes, { ingestRoutes } from "./telemetry";
import userRoutes from "./user";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/organizations", route: organizationRoutes },
  { path: "/teams", route: teamRoutes },
  { path: "/projects", route: projectRoutes },
  { path: "/services", route: serviceRoutes },
  { path: "/incidents", route: incidentRoutes },
  { path: "/alerts", route: alertRoutes },
  { path: "/alert-rules", route: alertRuleRoutes },
  { path: "/telemetry", route: telemetryRoutes },
  { path: "/ingest", route: ingestRoutes },
  { path: "/deployments", route: deploymentRoutes },
  { path: "/anomalies", route: anomalyRoutes },
  { path: "/correlations", route: correlationRoutes },
  { path: "/ai", route: aiRoutes },
  { path: "/documents", route: documentRoutes },
  { path: "/runbooks", route: runbookRoutes },
  { path: "/slos", route: sloRoutes },
  { path: "/postmortems", route: postmortemRoutes },
  { path: "/chaos", route: chaosRoutes },
  { path: "/notifications", route: notificationRoutes },
  { path: "/audit-logs", route: auditLogRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const apiRoutes = router;
export default router;
