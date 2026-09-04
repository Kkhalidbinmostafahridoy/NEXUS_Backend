/** Central location for validated environment configuration. */
export const config = () => ({
  port: Number(process.env.PORT ?? 3000),
  redisUrl: process.env.REDIS_URL,
  kafkaBrokers: process.env.KAFKA_BROKERS,
  clickhouseUrl: process.env.CLICKHOUSE_URL,
  aiServiceUrl: process.env.AI_SERVICE_URL,
});
