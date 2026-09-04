import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { NexusService } from "./nexus";

const call = (
  service: NexusService,
  resource: string,
  method: string,
  id?: string,
  body: Record<string, unknown> = {},
) => service.resource(resource, method, id, body);

@ApiTags("Organizations")
@ApiBearerAuth()
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly nexus: NexusService) {}
  @Post() @ApiOperation({ summary: "Create organization" }) create(
    @Body() body: Record<string, unknown>,
  ) {
    return call(this.nexus, "organizations", "POST", undefined, body);
  }
  @Get() list() {
    return call(this.nexus, "organizations", "GET");
  }
  @Get(":id") get(@Param("id") id: string) {
    return call(this.nexus, "organizations", "GET", id);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return call(this.nexus, "organizations", "PATCH", id, body);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return call(this.nexus, "organizations", "DELETE", id);
  }
  @Get(":id/members") members(@Param("id") id: string) {
    return this.nexus.members("organization", id, "GET");
  }
  @Post(":id/members") addMember(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.nexus.members("organization", id, "POST", undefined, body);
  }
}

@ApiTags("Projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectsController {
  constructor(private readonly nexus: NexusService) {}
  @Post() create(@Body() body: Record<string, unknown>) {
    return call(this.nexus, "projects", "POST", undefined, body);
  }
  @Get() list() {
    return call(this.nexus, "projects", "GET");
  }
  @Get(":id") get(@Param("id") id: string) {
    return call(this.nexus, "projects", "GET", id);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return call(this.nexus, "projects", "PATCH", id, body);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return call(this.nexus, "projects", "DELETE", id);
  }
}

@ApiTags("Services")
@ApiBearerAuth()
@Controller("services")
export class ServicesController {
  constructor(private readonly nexus: NexusService) {}
  @Post() create(@Body() body: Record<string, unknown>) {
    return call(this.nexus, "services", "POST", undefined, body);
  }
  @Get() list() {
    return call(this.nexus, "services", "GET");
  }
  @Get(":id") get(@Param("id") id: string) {
    return call(this.nexus, "services", "GET", id);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return call(this.nexus, "services", "PATCH", id, body);
  }
  @Delete(":id") remove(@Param("id") id: string) {
    return call(this.nexus, "services", "DELETE", id);
  }
  @Get(":id/dependencies") dependencies(@Param("id") id: string) {
    return this.nexus.dependency(id, "GET");
  }
  @Post(":id/dependencies") addDependency(
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.nexus.dependency(id, "POST", undefined, body);
  }
}

@ApiTags("Incidents")
@ApiBearerAuth()
@Controller("incidents")
export class IncidentsController {
  constructor(private readonly nexus: NexusService) {}
  @Post() create(@Body() body: Record<string, unknown>) {
    return call(this.nexus, "incidents", "POST", undefined, body);
  }
  @Get() list() {
    return call(this.nexus, "incidents", "GET");
  }
  @Get(":id") get(@Param("id") id: string) {
    return call(this.nexus, "incidents", "GET", id);
  }
  @Patch(":id") update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return call(this.nexus, "incidents", "PATCH", id, body);
  }
  @Post(":id/acknowledge") acknowledge(@Param("id") id: string) {
    return this.nexus.incidentAction(id, "acknowledge", {});
  }
  @Post(":id/resolve") resolve(@Param("id") id: string) {
    return this.nexus.incidentAction(id, "resolve", {});
  }
  @Get(":id/timeline") timeline(@Param("id") id: string) {
    return this.nexus.timeline(id);
  }
}

@ApiTags("Alert rules")
@ApiBearerAuth()
@Controller("alert-rules")
export class AlertRulesController {
  constructor(private readonly nexus: NexusService) {}
  @Post() create(@Body() body: Record<string, unknown>) {
    return call(this.nexus, "alert-rules", "POST", undefined, body);
  }
  @Get() list() {
    return call(this.nexus, "alert-rules", "GET");
  }
  @Patch(":id") update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return call(this.nexus, "alert-rules", "PATCH", id, body);
  }
  @Post(":id/enable") enable(@Param("id") id: string) {
    return this.nexus.ruleAction(id, "enable");
  }
  @Post(":id/disable") disable(@Param("id") id: string) {
    return this.nexus.ruleAction(id, "disable");
  }
}
