import { ModuleServer } from "../module-api";
export class AlertsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "alerts");
  }
  acknowledge(id: string) {
    return this.nexus.alertAction(id, "acknowledge");
  }
  resolve(id: string) {
    return this.nexus.alertAction(id, "resolve");
  }
}
