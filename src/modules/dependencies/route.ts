import { ModuleRoute } from "../module-api";
export const dependenciesRoutes: ModuleRoute[] = [
  { method: "GET", path: "/services/:id/dependencies", summary: "List dependencies" },
  { method: "POST", path: "/services/:id/dependencies", summary: "Create dependency" },
  {
    method: "DELETE",
    path: "/services/:id/dependencies/:dependencyId",
    summary: "Delete dependency",
  },
];
