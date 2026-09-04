CREATE DATABASE IF NOT EXISTS nexus;

CREATE TABLE IF NOT EXISTS nexus.telemetry_events
(
  id String,
  kind LowCardinality(String),
  service_id String,
  timestamp DateTime64(3),
  payload String,
  received_at DateTime64(3)
)
ENGINE = MergeTree
ORDER BY (service_id, kind, timestamp);
