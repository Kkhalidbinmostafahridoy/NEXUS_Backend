import { ModuleRoute } from "../module-api";
export const runbooksRoutes: ModuleRoute[] = [
  { method: "GET", path: "/runbooks", summary: "List runbooks" },
  { method: "POST", path: "/runbooks", summary: "Create runbook" },
];
