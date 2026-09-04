import { ModuleServer } from "../module-api";
export class AuditLogsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "audit-logs");
  }
}
