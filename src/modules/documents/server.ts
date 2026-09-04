import { ModuleServer } from "../module-api";
export class DocumentsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "documents");
  }
}
