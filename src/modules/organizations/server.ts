import { ModuleServer } from "../module-api";
export class OrganizationsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "organizations");
  }
}
