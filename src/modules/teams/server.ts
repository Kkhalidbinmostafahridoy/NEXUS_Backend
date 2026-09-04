import { ModuleServer } from "../module-api";
export class TeamsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "teams");
  }
}
