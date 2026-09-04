import { ModuleServer } from "../module-api";
export class UsersServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "users");
  }
}
