import { ModuleServer } from "../module-api";
export class RunbooksServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "runbooks");
  }
}
