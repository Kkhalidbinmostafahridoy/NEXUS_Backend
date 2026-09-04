import { ModuleRoute } from "../module-api";
export const deploymentsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/deployments", summary: "List deployments" },
  { method: "POST", path: "/deployments", summary: "Create deployment" },
];
