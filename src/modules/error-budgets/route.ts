import { ModuleRoute } from "../module-api";
export const errorBudgetsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/slos/:id/error-budget", summary: "Get error budget" },
];
