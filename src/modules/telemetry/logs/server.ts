import { TelemetryService } from "../../nexus";
export class LogsServer {
  constructor(private readonly telemetry: TelemetryService) {}
  list(id?: string) {
    return this.telemetry.list("logs", id);
  }
  publish(body: Record<string, unknown>) {
    return this.telemetry.publish("logs", body);
  }
}
