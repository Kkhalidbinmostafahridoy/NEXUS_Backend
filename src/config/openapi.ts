type OpenApiDocument = { paths: Record<string, Record<string, unknown>> };
const operation = (tag: string, summary: string) => ({
  tags: [tag],
  summary,
  responses: { "200": { description: "Successful response" } },
});
const crud = (doc: OpenApiDocument, tag: string, path: string) => {
  doc.paths[path] ??= {};
  Object.assign(doc.paths[path], {
    get: operation(tag, `List ${tag}`),
    post: operation(tag, `Create ${tag}`),
  });
  doc.paths[`${path}/{id}`] ??= {};
  Object.assign(doc.paths[`${path}/{id}`], {
    get: operation(tag, `Get ${tag} by ID`),
    patch: operation(tag, `Update ${tag}`),
    delete: operation(tag, `Delete ${tag}`),
  });
};
export function addNexusApiPaths(doc: any): any {
  const resources: Array<[string, string]> = [
    ["Users", "/api/v1/users"],
    ["Teams", "/api/v1/teams"],
    ["Projects", "/api/v1/projects"],
    ["Services", "/api/v1/services"],
    ["Alert rules", "/api/v1/alert-rules"],
    ["Alerts", "/api/v1/alerts"],
    ["Incidents", "/api/v1/incidents"],
    ["Deployments", "/api/v1/deployments"],
    ["Anomalies", "/api/v1/anomalies"],
    ["Correlations", "/api/v1/correlations"],
    ["Runbooks", "/api/v1/runbooks"],
    ["Documents", "/api/v1/documents"],
    ["SLOs", "/api/v1/slos"],
    ["Postmortems", "/api/v1/postmortems"],
    ["Notifications", "/api/v1/notifications"],
    ["Audit logs", "/api/v1/audit-logs"],
    ["Chaos", "/api/v1/chaos/experiments"],
  ];
  resources.forEach(([tag, path]) => crud(doc, tag, path));
  const extra: Array<[string, string, string, string]> = [
    ["Teams", "post", "/api/v1/teams/{id}/members", "Add team member"],
    ["Teams", "delete", "/api/v1/teams/{id}/members/{userId}", "Remove team member"],
    [
      "Organizations",
      "patch",
      "/api/v1/organizations/{id}/members/{memberId}",
      "Update organization member",
    ],
    [
      "Organizations",
      "delete",
      "/api/v1/organizations/{id}/members/{memberId}",
      "Remove organization member",
    ],
    ["Services", "post", "/api/v1/services/{id}/api-keys", "Create SDK API key"],
    ["Services", "get", "/api/v1/services/{id}/health", "Get service health"],
    ["Services", "get", "/api/v1/services/{id}/metrics", "Get service metrics"],
    ["Services", "get", "/api/v1/services/{id}/incidents", "Get service incidents"],
    [
      "Services",
      "delete",
      "/api/v1/services/{id}/dependencies/{dependencyId}",
      "Remove dependency",
    ],
    ["Telemetry", "post", "/api/v1/telemetry/logs", "Ingest log"],
    ["Telemetry", "post", "/api/v1/telemetry/logs/batch", "Ingest log batch"],
    ["Telemetry", "get", "/api/v1/telemetry/logs", "List logs"],
    ["Telemetry", "get", "/api/v1/telemetry/logs/{id}", "Get log"],
    ["Telemetry", "post", "/api/v1/telemetry/metrics", "Ingest metric"],
    ["Telemetry", "post", "/api/v1/telemetry/metrics/batch", "Ingest metric batch"],
    ["Telemetry", "get", "/api/v1/telemetry/metrics", "List metrics"],
    ["Telemetry", "post", "/api/v1/telemetry/traces", "Ingest trace"],
    ["Telemetry", "post", "/api/v1/telemetry/traces/batch", "Ingest trace batch"],
    ["Telemetry", "get", "/api/v1/telemetry/traces", "List traces"],
    ["Telemetry", "get", "/api/v1/telemetry/traces/{traceId}", "Get trace"],
    ["SDK ingestion", "post", "/api/v1/ingest/logs", "Ingest logs with API key"],
    ["SDK ingestion", "post", "/api/v1/ingest/metrics", "Ingest metrics with API key"],
    ["SDK ingestion", "post", "/api/v1/ingest/traces", "Ingest traces with API key"],
    ["Incidents", "post", "/api/v1/incidents/{id}/start-investigation", "Start investigation"],
    ["Incidents", "post", "/api/v1/incidents/{id}/mitigate", "Mitigate incident"],
    ["Incidents", "post", "/api/v1/incidents/{id}/reopen", "Reopen incident"],
    ["Incidents", "post", "/api/v1/incidents/{id}/assign", "Assign incident"],
    ["Incidents", "post", "/api/v1/incidents/{id}/timeline", "Add timeline event"],
    ["Incidents", "get", "/api/v1/incidents/{id}/logs", "Get incident logs"],
    ["Incidents", "get", "/api/v1/incidents/{id}/metrics", "Get incident metrics"],
    ["Incidents", "get", "/api/v1/incidents/{id}/traces", "Get incident traces"],
    ["Incidents", "get", "/api/v1/incidents/{id}/deployments", "Get incident deployments"],
    ["Alerts", "post", "/api/v1/alerts/{id}/acknowledge", "Acknowledge alert"],
    ["Alerts", "post", "/api/v1/alerts/{id}/resolve", "Resolve alert"],
    ["Alert rules", "post", "/api/v1/alert-rules/{id}/enable", "Enable rule"],
    ["Alert rules", "post", "/api/v1/alert-rules/{id}/disable", "Disable rule"],
    ["Anomalies", "post", "/api/v1/anomalies/detect", "Detect anomalies"],
    ["Correlations", "post", "/api/v1/correlations/analyze", "Analyze correlations"],
    ["AI investigations", "post", "/api/v1/ai/incidents/{id}/investigate", "Investigate incident"],
    ["AI investigations", "get", "/api/v1/ai/incidents/{id}/investigations", "List investigations"],
    ["AI investigations", "get", "/api/v1/ai/investigations/{id}", "Get investigation"],
    [
      "AI recommendations",
      "get",
      "/api/v1/ai/investigations/{id}/recommendations",
      "List recommendations",
    ],
    [
      "AI recommendations",
      "post",
      "/api/v1/ai/recommendations/{id}/approve",
      "Approve recommendation",
    ],
    [
      "AI recommendations",
      "post",
      "/api/v1/ai/recommendations/{id}/reject",
      "Reject recommendation",
    ],
    ["Knowledge", "post", "/api/v1/knowledge/search", "Search runbooks and documents"],
    ["SLOs", "get", "/api/v1/slos/{id}/error-budget", "Get error budget"],
    ["SLOs", "get", "/api/v1/slos/{id}/history", "Get SLO history"],
    ["Chaos", "post", "/api/v1/chaos/experiments/{id}/start", "Start experiment"],
    ["Chaos", "post", "/api/v1/chaos/experiments/{id}/stop", "Stop experiment"],
    ["Notifications", "post", "/api/v1/notifications/test", "Test notification"],
    ["Notifications", "patch", "/api/v1/notifications/{id}/read", "Mark notification read"],
  ];
  for (const [tag, method, path, summary] of extra) {
    doc.paths[path] ??= {};
    doc.paths[path][method] = operation(tag, summary);
  }
  return doc;
}
