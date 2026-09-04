import { Consumer, Kafka } from "kafkajs";

import { kafkaConfig } from "../../config/kafka";
import { DomainEvent, EventTopic } from "../../contracts/events";

export const eventConsumer = {
  async subscribe(
    topic: EventTopic,
    groupId: string,
    handler: (event: DomainEvent) => Promise<void>,
  ) {
    if (!kafkaConfig.enabled || !kafkaConfig.brokers.length) return undefined;

    const consumer: Consumer = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    }).consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) await handler(JSON.parse(message.value.toString()) as DomainEvent);
      },
    });

    return consumer;
  },
};
