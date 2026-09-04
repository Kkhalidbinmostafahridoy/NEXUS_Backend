import { Consumer, Kafka } from "kafkajs";

import { kafkaConfig } from "../../config/kafka";
import { DomainEvent, EventTopic, eventTopics } from "../../contracts/events";
import { eventProducer } from "./producer";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEvent = (value: Buffer | null): DomainEvent | null => {
  if (!value) return null;
  return JSON.parse(value.toString()) as DomainEvent;
};

const publishDeadLetter = async (
  sourceTopic: string,
  rawValue: string,
  error: unknown,
  attempt: number,
) => {
  await eventProducer.publish(eventTopics.deadLetter, {
    id: crypto.randomUUID(),
    type: eventTopics.deadLetter,
    occurredAt: new Date().toISOString(),
    organizationId: "system",
    payload: {
      sourceTopic,
      attempt,
      error: error instanceof Error ? error.message : String(error),
      rawValue,
    },
  });
};

export const eventConsumer = {
  async subscribe(
    topic: EventTopic,
    groupId: string,
    handler: (event: DomainEvent) => Promise<void>,
    options?: { maxRetries?: number },
  ) {
    if (!kafkaConfig.enabled || !kafkaConfig.brokers.length) return undefined;

    const maxRetries = options?.maxRetries ?? kafkaConfig.maxRetries;
    const consumer: Consumer = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    }).consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic });
    await consumer.run({
      eachMessage: async ({ topic: messageTopic, message }) => {
        const event = parseEvent(message.value);
        if (!event) return;

        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
          try {
            await handler(event);
            return;
          } catch (error) {
            if (attempt >= maxRetries) {
              await publishDeadLetter(
                messageTopic,
                message.value?.toString() ?? "",
                error,
                attempt,
              );
              console.error(`[${groupId}] handler failed after ${attempt} attempts`, error);
              return;
            }
            await sleep(kafkaConfig.retryDelayMs * attempt);
          }
        }
      },
    });

    return consumer;
  },

  async subscribeMany(
    topics: EventTopic[],
    groupId: string,
    handler: (event: DomainEvent) => Promise<void>,
    options?: { maxRetries?: number },
  ) {
    if (!kafkaConfig.enabled || !kafkaConfig.brokers.length) return undefined;

    const maxRetries = options?.maxRetries ?? kafkaConfig.maxRetries;
    const consumer: Consumer = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    }).consumer({ groupId });
    await consumer.connect();
    await Promise.all(topics.map((topic) => consumer.subscribe({ topic })));

    await consumer.run({
      eachMessage: async ({ topic: messageTopic, message }) => {
        const event = parseEvent(message.value);
        if (!event) return;

        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
          try {
            await handler(event);
            return;
          } catch (error) {
            if (attempt >= maxRetries) {
              await publishDeadLetter(
                messageTopic,
                message.value?.toString() ?? "",
                error,
                attempt,
              );
              console.error(`[${groupId}] handler failed after ${attempt} attempts`, error);
              return;
            }
            await sleep(kafkaConfig.retryDelayMs * attempt);
          }
        }
      },
    });

    return consumer;
  },
};
