import { ModuleServer } from "../module-api";
export class CorrelationsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "correlations");
  }
}
