export const kafkaConfig = { brokers: process.env.KAFKA_BROKERS?.split(",") ?? [] };
