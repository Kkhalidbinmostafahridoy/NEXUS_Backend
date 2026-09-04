import { ModuleRoute } from "../module-api";
export const notificationsRoutes: ModuleRoute[] = [
  { method: "GET", path: "/notifications", summary: "List notifications" },
  { method: "PATCH", path: "/notifications/:id/read", summary: "Mark notification read" },
];
