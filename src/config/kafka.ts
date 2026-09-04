export const kafkaConfig = {
  brokers: process.env.KAFKA_BROKERS?.split(",").filter(Boolean) ?? [],
  clientId: process.env.KAFKA_CLIENT_ID ?? "nexus-api",
  enabled: process.env.KAFKA_ENABLED === "true",
  maxRetries: Number(process.env.KAFKA_MAX_RETRIES ?? 3),
  retryDelayMs: Number(process.env.KAFKA_RETRY_DELAY_MS ?? 1000),
};
