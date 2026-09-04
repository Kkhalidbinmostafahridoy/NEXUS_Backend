import { ModuleRoute } from "../module-api";
export const chaosRoutes: ModuleRoute[] = [
  { method: "GET", path: "/chaos/experiments", summary: "List chaos experiments" },
  { method: "POST", path: "/chaos/experiments/:id/start", summary: "Start experiment" },
  { method: "POST", path: "/chaos/experiments/:id/stop", summary: "Stop experiment" },
];
