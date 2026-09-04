import { ModuleRoute } from "../module-api";
export const aiInvestigationsRoutes: ModuleRoute[] = [
  { method: "POST", path: "/ai/incidents/:id/investigate", summary: "Start AI investigation" },
  { method: "GET", path: "/ai/incidents/:id/investigations", summary: "List investigations" },
  { method: "GET", path: "/ai/investigations/:id", summary: "Get investigation" },
];
