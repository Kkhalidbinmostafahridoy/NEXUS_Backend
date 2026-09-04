import { ModuleRoute } from "../module-api";
export const anomaliesRoutes: ModuleRoute[] = [
  { method: "GET", path: "/anomalies", summary: "List anomalies" },
  { method: "POST", path: "/anomalies/detect", summary: "Detect anomalies" },
];
