import { TelemetryService } from "../../nexus";
export class MetricsServer {
  constructor(private readonly telemetry: TelemetryService) {}
  list(id?: string) {
    return this.telemetry.list("metrics", id);
  }
  publish(body: Record<string, unknown>) {
    return this.telemetry.publish("metrics", body);
  }
}
