import { clickhouseConfig } from "../../config/clickhouse";
import type { TelemetryKind, TelemetryRecord } from "../../app/modules/telemetry/telemetry.service";

type ClickHouseRow = {
  id: string;
  kind: string;
  service_id: string;
  timestamp: string;
  payload: string;
  received_at: string;
};

const authHeader = () => {
  const credentials = Buffer.from(`${clickhouseConfig.user}:${clickhouseConfig.password}`).toString(
    "base64",
  );
  return { Authorization: `Basic ${credentials}` };
};

const queryClickHouse = async (sql: string) => {
  const response = await fetch(
    `${clickhouseConfig.url}/?database=${clickhouseConfig.database}&default_format=JSONEachRow`,
    {
      method: "POST",
      headers: {
        ...authHeader(),
        "content-type": "text/plain",
      },
      body: sql,
    },
  );

  if (!response.ok) {
    throw new Error(`ClickHouse query failed with ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [] as ClickHouseRow[];

  return text
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as ClickHouseRow);
};

const rowToRecord = (row: ClickHouseRow): TelemetryRecord => {
  const payload = JSON.parse(row.payload) as Record<string, unknown>;
  return {
    ...payload,
    id: row.id,
    kind: row.kind as TelemetryKind,
    serviceId: row.service_id,
    timestamp: row.timestamp,
    receivedAt: row.received_at,
  };
};

const escapeLiteral = (value: string) => value.replace(/'/g, "''");

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
    const response = await fetch(
      `${clickhouseConfig.url}/?database=${clickhouseConfig.database}&query=INSERT%20INTO%20telemetry_events%20FORMAT%20JSONEachRow`,
      {
        method: "POST",
        headers: {
          ...authHeader(),
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

  async queryTelemetry(kind: TelemetryKind, serviceIds: string[], limit = 500) {
    if (!clickhouseConfig.enabled || !serviceIds.length) return null;

    const serviceFilter = serviceIds.map((id) => `'${escapeLiteral(id)}'`).join(", ");
    const rows = await queryClickHouse(`
      SELECT id, kind, service_id, timestamp, payload, received_at
      FROM telemetry_events
      WHERE kind = '${escapeLiteral(kind)}'
        AND service_id IN (${serviceFilter})
      ORDER BY timestamp DESC
      LIMIT ${Math.min(Math.max(limit, 1), 5000)}
    `);

    return rows.map(rowToRecord);
  },
};
