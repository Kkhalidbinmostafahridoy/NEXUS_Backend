import { DomainEvent } from "../../contracts/events";

type SpanContext = {
  traceId: string;
  spanId: string;
  name: string;
  startedAt: number;
};

const enabled = process.env.OTEL_ENABLED === "true";

const createSpan = (name: string, event?: DomainEvent): SpanContext => ({
  traceId: event?.id ?? crypto.randomUUID(),
  spanId: crypto.randomUUID(),
  name,
  startedAt: Date.now(),
});

const finishSpan = (span: SpanContext, error?: unknown) => {
  if (!enabled) return;
  const durationMs = Date.now() - span.startedAt;
  const status = error ? "error" : "ok";
  console.info(
    JSON.stringify({
      type: "span",
      name: span.name,
      traceId: span.traceId,
      spanId: span.spanId,
      durationMs,
      status,
      error: error instanceof Error ? error.message : undefined,
    }),
  );
};

export const initWorkerTelemetry = (serviceName: string) => {
  if (!enabled) return;
  console.info(JSON.stringify({ type: "telemetry.init", serviceName, enabled: true }));
};

export const withWorkerSpan = async <T>(
  name: string,
  event: DomainEvent,
  handler: () => Promise<T>,
): Promise<T> => {
  const span = createSpan(name, event);
  try {
    const result = await handler();
    finishSpan(span);
    return result;
  } catch (error) {
    finishSpan(span, error);
    throw error;
  }
};

export const initApiTelemetry = (serviceName: string) => {
  initWorkerTelemetry(serviceName);
};
