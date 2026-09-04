import "dotenv/config";

import { eventTopics } from "../src/contracts/events";
import { correlationEngine } from "../src/shared/correlation/engine";
import { eventConsumer } from "../src/shared/kafka/consumer";
import { initWorkerTelemetry, withWorkerSpan } from "../src/shared/telemetry/worker";

initWorkerTelemetry("nexus-correlation-worker");

const correlationTopics = [
  eventTopics.alertTriggered,
  eventTopics.anomalyDetected,
  eventTopics.deploymentCreated,
] as const;

void eventConsumer
  .subscribeMany([...correlationTopics], "nexus-correlation-worker", async (event) =>
    withWorkerSpan("correlation.handle", event, async () => {
      const serviceId = String(event.payload.serviceId ?? "");
      if (!serviceId) return;

      const signalType =
        event.type === eventTopics.alertTriggered
          ? "alert"
          : event.type === eventTopics.anomalyDetected
            ? "anomaly"
            : "deployment";

      const signalId = String(
        event.payload.alertId ??
          event.payload.anomalyId ??
          event.payload.deploymentId ??
          event.id,
      );

      await correlationEngine.evaluate({
        organizationId: event.organizationId,
        serviceId,
        signalType,
        signalId,
        metadata: event.payload,
      });
    }),
  )
  .catch((error) => {
    console.error("NEXUS correlation worker failed to start", error);
    process.exitCode = 1;
  });
