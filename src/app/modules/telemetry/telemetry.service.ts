import { AlertStatus, Prisma, Severity } from "@prisma/client";

import { prisma } from "../../../shared/prisma";
import { clickhouseClient } from "../../../shared/clickhouse/client";
import { incidentService } from "../incident/incident.service";
import { sloService } from "../slo/slo.service";
import { tenantService } from "../tenant.service";

export type TelemetryKind = "logs" | "metrics" | "traces";

export type TelemetryRecord = {
  id: string;
  kind: TelemetryKind;
  serviceId: string;
  timestamp: string;
  receivedAt: string;
  [key: string]: unknown;
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

const fromDatabase = (event: {
  id: string;
  kind: string;
  serviceId: string;
  timestamp: Date;
  receivedAt: Date;
  payload: Prisma.JsonValue;
}): TelemetryRecord => ({
  ...(event.payload as Record<string, unknown>),
  id: event.id,
  kind: event.kind as TelemetryKind,
  serviceId: event.serviceId,
  timestamp: event.timestamp.toISOString(),
  receivedAt: event.receivedAt.toISOString(),
});

export const telemetryService = {
  async list(kind: TelemetryKind, organizationId: string, serviceId?: string) {
    const serviceIds = await tenantService.serviceIds(organizationId);

    if (serviceId && !serviceIds.includes(serviceId)) {
      throw Object.assign(new Error("Service does not belong to the active organization."), {
        statusCode: 403,
      });
    }

    const events = await prisma.telemetryEvent.findMany({
      where: {
        kind,
        serviceId: serviceId
          ? serviceId
          : {
              in: serviceIds,
            },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 500,
    });

    return events.map(fromDatabase);
  },

  async ingest(
    kind: TelemetryKind,
    payloads: Record<string, unknown>[],
    apiKey: { organizationId: string; serviceId: string | null },
  ) {
    const accepted = payloads.map((payload) => asTelemetryRecord(kind, payload));

    for (const record of accepted) {
      if (apiKey.serviceId && apiKey.serviceId !== record.serviceId) {
        throw Object.assign(new Error("API key is not authorized for this service."), {
          statusCode: 403,
        });
      }
      await tenantService.service(record.serviceId, apiKey.organizationId);
    }

    await prisma.telemetryEvent.createMany({
      data: accepted.map((record) => ({
        id: record.id,
        kind: record.kind,
        serviceId: record.serviceId,
        timestamp: new Date(record.timestamp),
        receivedAt: new Date(record.receivedAt),
        payload: record as Prisma.InputJsonValue,
      })),
    });
    void clickhouseClient.writeTelemetry(accepted).catch(() => undefined);

    if (kind === "metrics") {
      await Promise.all(accepted.map((metric) => this.evaluateMetric(metric)));
    }

    return {
      accepted: accepted.length,
      events: accepted,
    };
  },

  async evaluateMetric(metric: TelemetryRecord) {
    if (typeof metric.metric !== "string" || typeof metric.value !== "number") return;

    await sloService.calculateForMetric(metric.serviceId, metric.metric, metric.value);

    const history = await prisma.telemetryEvent.findMany({
      where: {
        kind: "metrics",
        serviceId: metric.serviceId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 21,
    });
    const values = history
      .map(fromDatabase)
      .filter((record) => record.metric === metric.metric && typeof record.value === "number")
      .reverse();
    const baseline = values.slice(0, -1).map((record) => Number(record.value));

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
            metadata: {
              sampleSize: baseline.length,
            },
          },
        });
      }
    }

    const rules = await prisma.alertRule.findMany({
      where: {
        serviceId: metric.serviceId,
        metric: metric.metric,
        enabled: true,
      },
    });

    for (const rule of rules) {
      const compare = compares[rule.operator as keyof typeof compares];
      if (!compare || !compare(Number(metric.value), rule.threshold)) continue;

      const recent = await prisma.alert.findFirst({
        where: {
          ruleId: rule.id,
          status: {
            in: [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED],
          },
        },
      });
      if (recent) continue;

      const alert = await prisma.alert.create({
        data: {
          serviceId: metric.serviceId,
          ruleId: rule.id,
          title: rule.name,
          severity: rule.severity,
          payload: {
            metric: metric.metric,
            value: metric.value,
            threshold: rule.threshold,
          },
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
