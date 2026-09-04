export const kafkaConfig = {
  brokers: process.env.KAFKA_BROKERS?.split(",").filter(Boolean) ?? [],
  clientId: process.env.KAFKA_CLIENT_ID ?? "nexus-api",
  enabled: process.env.KAFKA_ENABLED === "true",
};
