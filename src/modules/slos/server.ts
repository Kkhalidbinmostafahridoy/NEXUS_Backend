import { ModuleServer } from "../module-api";
export class SlosServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "slos");
  }
  history(id: string) {
    return this.nexus.sloDetail(id, "history");
  }
}
