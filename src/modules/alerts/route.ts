import { ModuleRoute } from "../module-api";
export const alertsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/alerts", summary: "List alerts" },
  { method: "GET", path: "/alerts/:id", summary: "Get alert" },
  { method: "POST", path: "/alerts/:id/acknowledge", summary: "Acknowledge alert" },
  { method: "POST", path: "/alerts/:id/resolve", summary: "Resolve alert" },
];
