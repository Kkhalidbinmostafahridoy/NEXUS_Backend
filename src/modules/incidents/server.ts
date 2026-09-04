import { ModuleServer } from "../module-api";
export class IncidentsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "incidents");
  }
}
