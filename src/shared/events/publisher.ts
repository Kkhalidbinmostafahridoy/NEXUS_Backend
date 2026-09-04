import { createEvent, EventTopic } from "../../contracts/events";
import { eventProducer } from "../kafka/producer";

export const publishDomainEvent = (
  topic: EventTopic,
  organizationId: string,
  payload: Record<string, unknown>,
) => {
  void eventProducer
    .publish(topic, createEvent(topic, organizationId, payload))
    .catch(() => undefined);
};
