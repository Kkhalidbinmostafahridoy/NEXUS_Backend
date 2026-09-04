import { ModuleServer } from "../module-api";
export class ChaosServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "chaos/experiments");
  }
  start(id: string) {
    return this.nexus.chaosAction(id, "start");
  }
  stop(id: string) {
    return this.nexus.chaosAction(id, "stop");
  }
}
