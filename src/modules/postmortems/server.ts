import { ModuleServer } from "../module-api";
export class PostmortemsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "postmortems");
  }
}
