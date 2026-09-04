import { Kafka, Producer } from "kafkajs";

import { kafkaConfig } from "../../config/kafka";
import { DomainEvent, EventTopic } from "../../contracts/events";

let producer: Producer | undefined;

const getProducer = async () => {
  if (!kafkaConfig.enabled || !kafkaConfig.brokers.length) return undefined;

  if (!producer) {
    producer = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    }).producer();
    await producer.connect();
  }

  return producer;
};

export const eventProducer = {
  async publish(topic: EventTopic, event: DomainEvent) {
    const client = await getProducer();
    if (!client) return false;

    await client.send({
      topic,
      messages: [
        {
          key: event.organizationId,
          value: JSON.stringify(event),
        },
      ],
    });

    return true;
  },

  async disconnect() {
    await producer?.disconnect();
    producer = undefined;
  },
};
