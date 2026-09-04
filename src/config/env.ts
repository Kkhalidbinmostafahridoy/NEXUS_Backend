export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL,
  kafkaBrokers: process.env.KAFKA_BROKERS,
  aiServiceUrl: process.env.AI_SERVICE_URL,
};
