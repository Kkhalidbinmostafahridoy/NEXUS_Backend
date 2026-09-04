import "dotenv/config";

import { eventTopics } from "../src/contracts/events";
import { eventConsumer } from "../src/shared/kafka/consumer";
import { prisma } from "../src/shared/prisma";
import { initWorkerTelemetry, withWorkerSpan } from "../src/shared/telemetry/worker";

initWorkerTelemetry("nexus-notification-worker");

const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL?.trim() || "";

const deliverWebhook = async (payload: Record<string, unknown>) => {
  if (!webhookUrl) return;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Webhook delivery failed with ${response.status}`);
  }
};

const resolveRecipients = async (organizationId: string, userId?: string) => {
  if (userId) return [userId];

  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    select: { userId: true },
  });

  return members.map((member) => member.userId);
};

void eventConsumer
  .subscribe(eventTopics.notificationRequested, "nexus-notification-worker", async (event) =>
    withWorkerSpan("notification.handle", event, async () => {
      const channel = String(event.payload.channel ?? "in_app");
      const title = String(event.payload.title ?? "NEXUS notification");
      const body = String(event.payload.body ?? "");
      const userId = event.payload.userId ? String(event.payload.userId) : undefined;
      const recipients = await resolveRecipients(event.organizationId, userId);

      if (channel === "webhook") {
        await deliverWebhook({
          organizationId: event.organizationId,
          title,
          body,
          ...event.payload,
        });
        return;
      }

      if (!recipients.length) return;

      await prisma.notification.createMany({
        data: recipients.map((recipientId) => ({
          userId: recipientId,
          channel,
          title,
          body,
        })),
      });

      if (channel === "slack" && webhookUrl) {
        await deliverWebhook({
          text: `${title}\n${body}`,
          organizationId: event.organizationId,
        });
      }
    }),
  )
  .catch((error) => {
    console.error("NEXUS notification worker failed to start", error);
    process.exitCode = 1;
  });
