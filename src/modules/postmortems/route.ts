import { ModuleRoute } from "../module-api";
export const postmortemsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/postmortems", summary: "List postmortems" },
  { method: "POST", path: "/postmortems", summary: "Create postmortem" },
];
