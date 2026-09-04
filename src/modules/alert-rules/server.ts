import { ModuleServer } from "../module-api";
export class AlertRulesServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "alert-rules");
  }
}
