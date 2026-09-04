import "dotenv/config";

import { Severity } from "@prisma/client";

import { eventTopics } from "../src/contracts/events";
import { incidentService } from "../src/app/modules/incident/incident.service";
import { notificationService } from "../src/app/modules/notification/notification.service";
import { eventConsumer } from "../src/shared/kafka/consumer";
import { prisma } from "../src/shared/prisma";
import { initWorkerTelemetry, withWorkerSpan } from "../src/shared/telemetry/worker";

initWorkerTelemetry("nexus-alert-worker");

void eventConsumer
  .subscribe(eventTopics.alertTriggered, "nexus-alert-worker", async (event) =>
    withWorkerSpan("alert.handle", event, async () => {
      const alertId = String(event.payload.alertId);
      const serviceId = String(event.payload.serviceId);
      const severity = String(event.payload.severity) as Severity;
      const title = String(event.payload.title ?? "Alert triggered");

      const alert = await prisma.alert.findUnique({ where: { id: alertId } });
      if (!alert) return;

      if (severity === Severity.P1 || severity === Severity.P2) {
        await incidentService.findOrCreateForAlert(serviceId, `${title}: ${serviceId}`, severity, alertId);
      }

      notificationService.request(event.organizationId, {
        channel: "in_app",
        title: `Alert: ${title}`,
        body: `${severity} alert triggered on service ${serviceId}.`,
        alertId,
      });
    }),
  )
  .catch((error) => {
    console.error("NEXUS alert worker failed to start", error);
    process.exitCode = 1;
  });
