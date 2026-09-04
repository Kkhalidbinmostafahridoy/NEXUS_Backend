import { ModuleRoute } from "../module-api";
export const documentsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/documents", summary: "List documents" },
  { method: "POST", path: "/documents", summary: "Create document" },
];
