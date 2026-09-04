import { ModuleServer } from "../module-api";
export class ServicesServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "services");
  }
}
