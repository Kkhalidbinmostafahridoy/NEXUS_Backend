import {
  All,
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Req,
} from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import * as argon2 from "argon2";
import { randomBytes, randomUUID } from "crypto";

type AnyRecord = Record<string, unknown>;
const MODEL: Record<string, string> = {
  users: "user",
  organizations: "organization",
  teams: "team",
  projects: "project",
  services: "service",
  "alert-rules": "alertRule",
  alerts: "alert",
  incidents: "incident",
  anomalies: "anomaly",
  correlations: "correlation",
  deployments: "deployment",
  slos: "sloDefinition",
  postmortems: "postmortem",
  runbooks: "runbook",
  documents: "document",
  notifications: "notification",
  "audit-logs": "auditLog",
  "chaos/experiments": "chaosExperiment",
};
const TELEMETRY = new Set(["logs", "metrics", "traces"]);

@Injectable()
export class TelemetryService {
  private readonly data: Record<string, AnyRecord[]> = { logs: [], metrics: [], traces: [] };
  async publish(kind: string, payload: AnyRecord | AnyRecord[]) {
    const entries = Array.isArray(payload) ? payload : [payload];
    const saved = entries.map((item) => ({
      id: randomUUID(),
      ...item,
      receivedAt: new Date().toISOString(),
    }));
    this.data[kind].push(...saved);
    return { accepted: saved.length, events: saved };
  }
  list(kind: string, id?: string) {
    const result = id
      ? this.data[kind].filter((item) => item.id === id || item.traceId === id)
      : this.data[kind];
    return id && !result.length ? null : result;
  }
}

@Injectable()
export class NexusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetry: TelemetryService,
  ) {}
  private repo(resource: string): any {
    const model = MODEL[resource];
    if (!model) throw new HttpException(`Unknown resource: ${resource}`, 404);
    return (this.prisma as any)[model];
  }
  async resource(resource: string, method: string, id?: string, body: AnyRecord = {}) {
    const repo = this.repo(resource);
    if (method === "GET")
      return id
        ? repo.findUnique({ where: { id } })
        : repo.findMany({ orderBy: { createdAt: "desc" } });
    if (method === "POST") return repo.create({ data: body });
    if (method === "PATCH") return repo.update({ where: { id }, data: body });
    if (method === "DELETE") return repo.delete({ where: { id } });
    throw new HttpException("Unsupported method", 405);
  }
  async telemetryRoute(kind: string, method: string, id: string | undefined, body: AnyRecord) {
    if (method === "GET") return this.telemetry.list(kind, id);
    if (method === "POST") return this.telemetry.publish(kind, (body.items as AnyRecord[]) ?? body);
    throw new HttpException("Unsupported method", 405);
  }
  async createApiKey(serviceId: string, body: AnyRecord) {
    const service = await (this.prisma as any).service.findUnique({ where: { id: serviceId } });
    if (!service) throw new HttpException("Service not found", 404);
    const project = await (this.prisma as any).project.findUnique({
      where: { id: service.projectId },
    });
    if (!project) throw new HttpException("Service project not found", 404);
    const secret = `nx_live_${randomBytes(24).toString("hex")}`;
    const key = await (this.prisma as any).apiKey.create({
      data: {
        name: String(body.name ?? "SDK key"),
        prefix: secret.slice(0, 16),
        keyHash: await argon2.hash(secret),
        serviceId,
        organizationId: project.organizationId,
      },
    });
    return {
      id: key.id,
      name: key.name,
      apiKey: secret,
      warning: "Copy this key now; it is never returned again.",
    };
  }
  async verifyApiKey(secret: string) {
    const candidates: any[] = await (this.prisma as any).apiKey.findMany({
      where: { prefix: secret.slice(0, 16), revokedAt: null },
    });
    const key = await Promise.any(
      candidates.map(async (item: any) =>
        (await argon2.verify(item.keyHash, secret)) ? item : Promise.reject(),
      ),
    );
    await (this.prisma as any).apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });
    return key;
  }
  async evidence(incidentId: string, kind: string) {
    const incident = await (this.prisma as any).incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new HttpException("Incident not found", 404);
    const services = await (this.prisma as any).incidentService.findMany({ where: { incidentId } });
    const serviceIds = services.map((s: any) => s.serviceId);
    if (kind === "deployments")
      return (this.prisma as any).deployment.findMany({
        where: { serviceId: { in: serviceIds } },
        orderBy: { deployedAt: "desc" },
      });
    return (this.telemetry.list(kind) ?? []).filter((item: any) =>
      serviceIds.includes(String(item.serviceId)),
    );
  }
  async dependency(serviceId: string, method: string, dependencyId?: string, body: AnyRecord = {}) {
    if (method === "GET")
      return (this.prisma as any).serviceDependency.findMany({ where: { serviceId } });
    if (method === "POST")
      return (this.prisma as any).serviceDependency.create({
        data: {
          serviceId,
          dependsOnServiceId: String(body.dependsOnServiceId),
          type: String(body.type ?? "HTTP"),
        },
      });
    if (method === "DELETE" && dependencyId)
      return (this.prisma as any).serviceDependency.delete({ where: { id: dependencyId } });
    throw new HttpException("Unsupported method", 405);
  }
  async incidentAction(id: string, action: string, body: AnyRecord) {
    const statuses: Record<string, string> = {
      acknowledge: "ACKNOWLEDGED",
      "start-investigation": "INVESTIGATING",
      mitigate: "MITIGATING",
      resolve: "RESOLVED",
      reopen: "OPEN",
    };
    if (action === "assign")
      return (this.prisma as any).incident.update({
        where: { id },
        data: { assigneeId: String(body.userId) },
      });
    if (action === "timeline")
      return (this.prisma as any).incidentEvent.create({
        data: {
          incidentId: id,
          type: String(body.type ?? "NOTE"),
          message: String(body.message),
          metadata: body.metadata as any,
        },
      });
    const status = statuses[action];
    if (!status) throw new HttpException("Unknown incident action", 404);
    return (this.prisma as any).incident.update({
      where: { id },
      data: { status: status as any, resolvedAt: action === "resolve" ? new Date() : undefined },
    });
  }
  async timeline(id: string) {
    return (this.prisma as any).incidentEvent.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "asc" },
    });
  }
  async members(
    scope: "organization" | "team",
    id: string,
    method: string,
    memberId?: string,
    body: AnyRecord = {},
  ) {
    const repo: any =
      scope === "organization"
        ? (this.prisma as any).organizationMember
        : (this.prisma as any).teamMember;
    const key = scope === "organization" ? "organizationId" : "teamId";
    if (method === "GET") return repo.findMany({ where: { [key]: id } });
    if (method === "POST")
      return repo.create({
        data: {
          [key]: id,
          userId: String(body.userId),
          ...(scope === "organization" ? { role: body.role ?? "MEMBER" } : {}),
        },
      });
    if (method === "PATCH" && scope === "organization")
      return repo.update({ where: { id: memberId }, data: { role: body.role as any } });
    if (method === "DELETE")
      return scope === "organization"
        ? repo.delete({ where: { id: memberId } })
        : repo.delete({ where: { teamId_userId: { teamId: id, userId: memberId } } });
    throw new HttpException("Unsupported member operation", 405);
  }
  async alertAction(id: string, action: string) {
    if (action === "acknowledge")
      return (this.prisma as any).alert.update({
        where: { id },
        data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
      });
    if (action === "resolve")
      return (this.prisma as any).alert.update({
        where: { id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
    throw new HttpException("Unknown alert action", 404);
  }
  async ruleAction(id: string, action: string) {
    return (this.prisma as any).alertRule.update({
      where: { id },
      data: { enabled: action === "enable" },
    });
  }
  async recommendation(id: string, approved: boolean) {
    return (this.prisma as any).aiRecommendation.update({
      where: { id },
      data: { status: approved ? "APPROVED" : "REJECTED", reviewedAt: new Date() },
    });
  }
  async investigations(incidentId: string) {
    return (this.prisma as any).aiInvestigation.findMany({ where: { incidentId } });
  }
  async investigation(id: string) {
    return (this.prisma as any).aiInvestigation.findUnique({ where: { id } });
  }
  async search(query: string) {
    return (this.prisma as any).document.findMany({
      where: { content: { contains: query, mode: "insensitive" } },
      take: 10,
    });
  }
  async sloDetail(id: string, view: string) {
    const slo = await (this.prisma as any).sloDefinition.findUnique({ where: { id } });
    if (!slo) throw new HttpException("SLO not found", 404);
    const measurements = await (this.prisma as any).sloMeasurement.findMany({
      where: { sloId: id },
      orderBy: { measuredAt: "desc" },
      take: 100,
    });
    if (view === "error-budget")
      return { sloId: id, remaining: measurements[0]?.errorBudgetRemaining ?? 100 };
    return measurements;
  }
  async chaosAction(id: string, action: string) {
    return (this.prisma as any).chaosExperiment.update({
      where: { id },
      data:
        action === "start"
          ? { status: "RUNNING", startedAt: new Date() }
          : { status: "STOPPED", stoppedAt: new Date() },
    });
  }
  async notificationAction(id: string, action: string) {
    if (action !== "read") throw new HttpException("Unknown notification action", 404);
    return (this.prisma as any).notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
  async investigate(incidentId: string) {
    const incident = await (this.prisma as any).incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new HttpException("Incident not found", 404);
    const investigation = await (this.prisma as any).aiInvestigation.create({
      data: {
        incidentId,
        summary: `Investigation started for ${incident.title}. Review telemetry and recent deployments before acting.`,
        rootCause: "Pending evidence review",
        confidence: 0,
        completedAt: new Date(),
      },
    });
    const recommendation = await (this.prisma as any).aiRecommendation.create({
      data: {
        investigationId: investigation.id,
        action: "REVIEW_RUNBOOK",
        reason: "AI recommendations require engineer approval before production changes.",
        confidence: 0.5,
      },
    });
    return { ...investigation, recommendations: [recommendation] };
  }
}

@Controller()
export class NexusController {
  constructor(private readonly nexus: NexusService) {}
  @All("{*path}")
  async dispatch(
    @Req() req: any,
    @Body() body: AnyRecord,
    @Headers("x-nexus-api-key") apiKey?: string,
  ) {
    const path = String(req.params.path ?? req.params[0] ?? "").replace(/^\//, "");
    const parts = path.split("/");
    const method = req.method as string;
    if (parts[0] === "telemetry" && TELEMETRY.has(parts[1]))
      return this.nexus.telemetryRoute(parts[1], method, parts[2], body ?? {});
    if (parts[0] === "ingest" && TELEMETRY.has(parts[1])) {
      if (!apiKey?.startsWith("nx_live_"))
        throw new HttpException("X-NEXUS-API-KEY is required", HttpStatus.UNAUTHORIZED);
      try {
        await this.nexus.verifyApiKey(apiKey);
      } catch {
        throw new HttpException("Invalid API key", HttpStatus.UNAUTHORIZED);
      }
      return this.nexus.telemetryRoute(parts[1], method, undefined, body ?? {});
    }
    if ((parts[0] === "organizations" || parts[0] === "teams") && parts[2] === "members")
      return this.nexus.members(
        parts[0] === "organizations" ? "organization" : "team",
        parts[1],
        method,
        parts[3],
        body ?? {},
      );
    if (parts[0] === "services" && parts[2] === "dependencies")
      return this.nexus.dependency(parts[1], method, parts[3], body ?? {});
    if (parts[0] === "services" && parts[2] === "api-keys" && method === "POST")
      return this.nexus.createApiKey(parts[1], body ?? {});
    if (parts[0] === "services" && ["health", "metrics", "incidents"].includes(parts[2]))
      return { serviceId: parts[1], status: "available", data: [] };
    if (parts[0] === "incidents" && parts[2] === "timeline")
      return method === "GET"
        ? this.nexus.timeline(parts[1])
        : this.nexus.incidentAction(parts[1], "timeline", body ?? {});
    if (
      parts[0] === "incidents" &&
      ["logs", "metrics", "traces", "deployments"].includes(parts[2]) &&
      method === "GET"
    )
      return this.nexus.evidence(parts[1], parts[2]);
    if (parts[0] === "incidents" && parts[2] && method === "POST")
      return this.nexus.incidentAction(parts[1], parts[2], body ?? {});
    if (parts[0] === "alerts" && parts[2] && method === "POST")
      return this.nexus.alertAction(parts[1], parts[2]);
    if (parts[0] === "alert-rules" && parts[2] && method === "POST")
      return this.nexus.ruleAction(parts[1], parts[2]);
    if (parts[0] === "ai" && parts[1] === "incidents" && parts[3] === "investigate")
      return this.nexus.investigate(parts[2]);
    if (parts[0] === "ai" && parts[1] === "incidents" && parts[3] === "investigations")
      return this.nexus.investigations(parts[2]);
    if (parts[0] === "ai" && parts[1] === "investigations")
      return this.nexus.investigation(parts[2]);
    if (parts[0] === "ai" && parts[1] === "recommendations")
      return this.nexus.recommendation(parts[2], parts[3] === "approve");
    if (parts[0] === "knowledge" && parts[1] === "search")
      return this.nexus.search(String(body?.query ?? ""));
    if (parts[0] === "slos" && ["error-budget", "history"].includes(parts[2]) && method === "GET")
      return this.nexus.sloDetail(parts[1], parts[2]);
    if (parts[0] === "chaos" && parts[3] && method === "POST")
      return this.nexus.chaosAction(parts[2], parts[3]);
    if (parts[0] === "notifications" && parts[2] === "read" && method === "PATCH")
      return this.nexus.notificationAction(parts[1], parts[2]);
    const resource = parts[0] === "chaos" ? "chaos/experiments" : parts[0];
    const id = parts[0] === "chaos" ? parts[2] : parts[1];
    return this.nexus.resource(resource, method, id, body ?? {});
  }
}
