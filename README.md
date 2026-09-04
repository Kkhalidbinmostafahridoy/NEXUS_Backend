# NEXUS: Next.js + Express + TypeScript

Operational-intelligence backend for telemetry, alerts, incidents, investigations, recommendations, and postmortems.

## Start API

1. Copy `.env.example` to `.env` and set the PostgreSQL credentials. **Do not create another database**: the URL must point at your existing database. Since you ran `CREATE DATABASE NEXUS;` without quotes, PostgreSQL named it `nexus`; this is already used in the example URL.
2. Run `npm install`, `npm run prisma:generate`, and `npm run prisma:migrate -- --name init`.
3. Optionally start the supporting services with `docker compose up -d`.
4. Run `npm run start:dev`; Express API is at `http://localhost:3000/api/v1`.

## Start Next.js dashboard

1. Copy `web/.env.local.example` to `web/.env.local`.
2. Run `npm install --prefix web` and `npm run dev --prefix web`.
3. Open `http://localhost:3001` if the API is already using port 3000.

All business routes begin at `/api/v1`. Register first, then send `Authorization: Bearer <accessToken>` for protected endpoints. SDK ingestion uses `X-NEXUS-API-KEY`.

Telemetry API keys are service-scoped: every ingested event must contain the matching
`serviceId`. Telemetry is stored durably in PostgreSQL and can later be mirrored to ClickHouse.
For automatic SLO calculation, set the SLO `indicator` to the telemetry metric name and submit
metric events with `good: false` (or an HTTP `status >= 500`) for failed samples.

The API is deliberately event-oriented: writes publish domain events to the in-process event bus now, whose `EventPublisher` can be switched to Redpanda without changing controllers.
