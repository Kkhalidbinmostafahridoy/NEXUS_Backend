-- Durable telemetry fallback storage. A ClickHouse adapter can consume the same event shape later.
CREATE TABLE "TelemetryEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TelemetryEvent_serviceId_kind_timestamp_idx"
ON "TelemetryEvent"("serviceId", "kind", "timestamp");
