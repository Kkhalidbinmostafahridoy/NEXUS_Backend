import { NexusService } from "./nexus";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
export type ModuleRoute = { method: HttpMethod; path: string; summary: string };

/** Shared feature-module facade. Database work stays in NexusService until each module is split into its own service. */
export class ModuleServer {
  constructor(
    protected readonly nexus: NexusService,
    private readonly resource: string,
  ) {}
  list() {
    return this.nexus.resource(this.resource, "GET");
  }
  get(id: string) {
    return this.nexus.resource(this.resource, "GET", id);
  }
  create(body: Record<string, unknown>) {
    return this.nexus.resource(this.resource, "POST", undefined, body);
  }
  update(id: string, body: Record<string, unknown>) {
    return this.nexus.resource(this.resource, "PATCH", id, body);
  }
  remove(id: string) {
    return this.nexus.resource(this.resource, "DELETE", id);
  }
}
