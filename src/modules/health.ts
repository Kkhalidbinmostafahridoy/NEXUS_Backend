import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async health() {
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
      return {
        status: "ok",
        checks: {
          api: "ok",
          postgres: "ok",
          redis: process.env.REDIS_URL ? "configured" : "not-configured",
          redpanda: process.env.KAFKA_BROKERS ? "configured" : "not-configured",
          clickhouse: process.env.CLICKHOUSE_URL ? "configured" : "not-configured",
          ai: process.env.AI_SERVICE_URL ? "configured" : "not-configured",
        },
      };
    } catch {
      throw new ServiceUnavailableException({ status: "degraded", checks: { postgres: "down" } });
    }
  }
  @Get("live") live() {
    return { status: "ok" };
  }
  @Get("ready") async ready() {
    await this.prisma.$queryRawUnsafe("SELECT 1");
    return { status: "ready" };
  }
}
