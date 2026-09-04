import { clickhouseConfig } from "../../config/clickhouse";
import type { TelemetryRecord } from "../../app/modules/telemetry/telemetry.service";

export const clickhouseClient = {
  async writeTelemetry(records: TelemetryRecord[]) {
    if (!clickhouseConfig.enabled || !records.length) return false;

    const body = records
      .map((record) =>
        JSON.stringify({
          id: record.id,
          kind: record.kind,
          service_id: record.serviceId,
          timestamp: record.timestamp,
          payload: JSON.stringify(record),
          received_at: record.receivedAt,
        }),
      )
      .join("\n");
    const credentials = Buffer.from(
      `${clickhouseConfig.user}:${clickhouseConfig.password}`,
    ).toString("base64");
    const response = await fetch(
      `${clickhouseConfig.url}/?database=${clickhouseConfig.database}&query=INSERT%20INTO%20telemetry_events%20FORMAT%20JSONEachRow`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "content-type": "application/json",
        },
        body,
      },
    );

    if (!response.ok) {
      throw new Error(`ClickHouse telemetry write failed with ${response.status}`);
    }

    return true;
  },
};
