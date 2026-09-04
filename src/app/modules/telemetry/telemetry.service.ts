import { AlertStatus, Severity } from "@prisma/client";

import { prisma } from "../../../shared/prisma";
import { incidentService } from "../incident/incident.service";

export type TelemetryKind = "logs" | "metrics" | "traces";

export type TelemetryRecord = {
  id: string;
  kind: TelemetryKind;
  serviceId: string;
  timestamp: string;
  receivedAt: string;
  [key: string]: unknown;
};

const records: Record<TelemetryKind, TelemetryRecord[]> = {
  logs: [],
  metrics: [],
  traces: [],
};

const compares = {
  ">": (value: number, threshold: number) => value > threshold,
  ">=": (value: number, threshold: number) => value >= threshold,
  "<": (value: number, threshold: number) => value < threshold,
  "<=": (value: number, threshold: number) => value <= threshold,
  "=": (value: number, threshold: number) => value === threshold,
};

const asTelemetryRecord = (
  kind: TelemetryKind,
  payload: Record<string, unknown>,
): TelemetryRecord => {
  if (!payload.serviceId || typeof payload.serviceId !== "string") {
    throw Object.assign(new Error("serviceId is required"), { statusCode: 400 });
  }

  return {
    ...payload,
    id: crypto.randomUUID(),
    kind,
    serviceId: payload.serviceId,
    timestamp: typeof payload.timestamp === "string" ? payload.timestamp : new Date().toISOString(),
    receivedAt: new Date().toISOString(),
  };
};

export const telemetryService = {
  list(kind: TelemetryKind, serviceId?: string) {
    return serviceId
      ? records[kind].filter((record) => record.serviceId === serviceId)
      : records[kind];
  },

  async ingest(kind: TelemetryKind, payloads: Record<string, unknown>[]) {
    const accepted = payloads.map((payload) => asTelemetryRecord(kind, payload));
    records[kind].push(...accepted);

    if (kind === "metrics") {
      await Promise.all(accepted.map((metric) => this.evaluateMetric(metric)));
    }

    return { accepted: accepted.length, events: accepted };
  },

  async evaluateMetric(metric: TelemetryRecord) {
    if (typeof metric.metric !== "string" || typeof metric.value !== "number") return;

    const history = records.metrics
      .filter(
        (record) =>
          record.serviceId === metric.serviceId &&
          record.metric === metric.metric &&
          typeof record.value === "number",
      )
      .slice(-21);
    const baseline = history.slice(0, -1).map((record) => Number(record.value));

    if (baseline.length >= 5) {
      const mean = baseline.reduce((total, value) => total + value, 0) / baseline.length;
      const variance =
        baseline.reduce((total, value) => total + (value - mean) ** 2, 0) / baseline.length;
      const deviation = Math.sqrt(variance);
      const score = deviation === 0 ? 0 : Math.abs((Number(metric.value) - mean) / deviation);

      if (score >= 3) {
        await prisma.anomaly.create({
          data: {
            serviceId: metric.serviceId,
            metric: metric.metric,
            method: "Z_SCORE",
            score,
            observed: Number(metric.value),
            expected: mean,
            metadata: { sampleSize: baseline.length },
          },
        });
      }
    }

    const rules = await prisma.alertRule.findMany({
      where: { serviceId: metric.serviceId, metric: metric.metric, enabled: true },
    });

    for (const rule of rules) {
      const compare = compares[rule.operator as keyof typeof compares];
      if (!compare || !compare(Number(metric.value), rule.threshold)) continue;

      const recent = await prisma.alert.findFirst({
        where: { ruleId: rule.id, status: { in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED] } },
      });
      if (recent) continue;

      const alert = await prisma.alert.create({
        data: {
          serviceId: metric.serviceId,
          ruleId: rule.id,
          title: rule.name,
          severity: rule.severity,
          payload: { metric: metric.metric, value: metric.value, threshold: rule.threshold },
        },
      });

      if (rule.severity === Severity.P1 || rule.severity === Severity.P2) {
        await incidentService.findOrCreateForAlert(
          metric.serviceId,
          `${rule.name}: ${metric.serviceId}`,
          rule.severity,
          alert.id,
        );
      }
    }
  },
};
