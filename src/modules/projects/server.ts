import { ModuleServer } from "../module-api";
export class ProjectsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "projects");
  }
}
