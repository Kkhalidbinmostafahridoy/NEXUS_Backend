import "dotenv/config";

import { eventTopics } from "../src/contracts/events";
import { incidentService } from "../src/app/modules/incident/incident.service";
import { notificationService } from "../src/app/modules/notification/notification.service";
import { severityFromAnomalyScore } from "../src/shared/correlation/engine";
import { eventConsumer } from "../src/shared/kafka/consumer";
import { prisma } from "../src/shared/prisma";
import { initWorkerTelemetry, withWorkerSpan } from "../src/shared/telemetry/worker";

initWorkerTelemetry("nexus-anomaly-worker");

void eventConsumer
  .subscribe(eventTopics.anomalyDetected, "nexus-anomaly-worker", async (event) =>
    withWorkerSpan("anomaly.handle", event, async () => {
      const anomalyId = String(event.payload.anomalyId);
      const serviceId = String(event.payload.serviceId);
      const score = Number(event.payload.score);
      const metric = String(event.payload.metric ?? "metric");

      const anomaly = await prisma.anomaly.findUnique({ where: { id: anomalyId } });
      if (!anomaly) return;

      const severity = severityFromAnomalyScore(score);
      if (severity) {
        await incidentService.findOrCreateForAlert(
          serviceId,
          `Anomaly on ${metric}: ${serviceId}`,
          severity,
          anomalyId,
        );

        notificationService.request(event.organizationId, {
          channel: "in_app",
          title: `Anomaly detected: ${metric}`,
          body: `Z-score ${score.toFixed(2)} on ${serviceId}.`,
          alertId: anomalyId,
        });
      }
    }),
  )
  .catch((error) => {
    console.error("NEXUS anomaly worker failed to start", error);
    process.exitCode = 1;
  });
