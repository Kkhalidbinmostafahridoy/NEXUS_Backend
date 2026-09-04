import { ModuleRoute } from "../module-api";
export const auditLogsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/audit-logs", summary: "List audit logs" },
  { method: "GET", path: "/audit-logs/:id", summary: "Get audit log" },
];
