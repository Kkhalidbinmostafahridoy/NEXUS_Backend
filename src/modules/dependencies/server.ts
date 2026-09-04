import { NexusService } from "../nexus";
export class DependenciesServer {
  constructor(private readonly nexus: NexusService) {}
  list(id: string) {
    return this.nexus.dependency(id, "GET");
  }
  create(id: string, body: Record<string, unknown>) {
    return this.nexus.dependency(id, "POST", undefined, body);
  }
  remove(id: string, dependencyId: string) {
    return this.nexus.dependency(id, "DELETE", dependencyId);
  }
}
