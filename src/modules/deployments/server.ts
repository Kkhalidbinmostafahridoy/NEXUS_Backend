import { ModuleServer } from "../module-api";
export class DeploymentsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "deployments");
  }
}
