import { TelemetryService } from "../../nexus";
export class TracesServer {
  constructor(private readonly telemetry: TelemetryService) {}
  list(id?: string) {
    return this.telemetry.list("traces", id);
  }
  publish(body: Record<string, unknown>) {
    return this.telemetry.publish("traces", body);
  }
}
