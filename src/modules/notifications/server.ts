import { ModuleServer } from "../module-api";
export class NotificationsServer extends ModuleServer {
  constructor(nexus: any) {
    super(nexus, "notifications");
  }
  read(id: string) {
    return this.nexus.notificationAction(id, "read");
  }
}
