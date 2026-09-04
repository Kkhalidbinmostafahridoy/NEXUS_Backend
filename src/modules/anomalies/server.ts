import { ModuleServer } from "../module-api";
export class AnomaliesServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "anomalies");
  }
}
