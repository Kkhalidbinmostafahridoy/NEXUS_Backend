import { ModuleRoute } from "../module-api";
export const correlationsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/correlations", summary: "List correlations" },
  { method: "POST", path: "/correlations/analyze", summary: "Analyze correlations" },
];
