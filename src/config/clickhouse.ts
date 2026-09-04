export const clickhouseConfig = {
  enabled: process.env.CLICKHOUSE_ENABLED === "true",
  url: process.env.CLICKHOUSE_URL ?? "http://localhost:8123",
  database: process.env.CLICKHOUSE_DATABASE ?? "nexus",
  user: process.env.CLICKHOUSE_USER ?? "nexus",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
};
