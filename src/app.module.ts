import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";
import { PrismaService } from "./shared/prisma.service";
import { AuthController, AuthService } from "./modules/auth";
import { NexusController, NexusService, TelemetryService } from "./modules/nexus";
import { HealthController } from "./modules/health";
import {
  AlertRulesController,
  IncidentsController,
  OrganizationsController,
  ProjectsController,
  ServicesController,
} from "./modules/core.controllers";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(24),
        JWT_ACCESS_SECRET: Joi.string().min(24),
        JWT_REFRESH_SECRET: Joi.string().min(24),
        PORT: Joi.number().default(3000),
      }).or("JWT_SECRET", "JWT_ACCESS_SECRET"),
    }),
  ],
  controllers: [
    AuthController,
    OrganizationsController,
    ProjectsController,
    ServicesController,
    IncidentsController,
    AlertRulesController,
    HealthController,
    NexusController,
  ],
  providers: [PrismaService, AuthService, NexusService, TelemetryService],
})
export class AppModule {}
