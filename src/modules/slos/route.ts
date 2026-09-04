import { ModuleRoute } from "../module-api";
export const slosRoutes: ModuleRoute[] = [
  { method: "GET", path: "/slos", summary: "List SLOs" },
  { method: "POST", path: "/slos", summary: "Create SLO" },
  { method: "GET", path: "/slos/:id/history", summary: "Get SLO history" },
];
