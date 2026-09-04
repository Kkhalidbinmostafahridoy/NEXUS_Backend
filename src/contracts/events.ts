export const eventTopics = {
  alertTriggered: "nexus.alert.triggered",
  anomalyDetected: "nexus.anomaly.detected",
  deploymentCreated: "nexus.deployment.created",
  incidentUpdated: "nexus.incident.updated",
  aiInvestigationRequested: "nexus.ai.investigation.requested",
  notificationRequested: "nexus.notification.requested",
} as const;

export type EventTopic = (typeof eventTopics)[keyof typeof eventTopics];

export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: EventTopic;
  occurredAt: string;
  organizationId: string;
  payload: TPayload;
};

export const createEvent = <TPayload extends Record<string, unknown>>(
  type: EventTopic,
  organizationId: string,
  payload: TPayload,
): DomainEvent<TPayload> => ({
  id: crypto.randomUUID(),
  type,
  occurredAt: new Date().toISOString(),
  organizationId,
  payload,
});
