export interface AlertRulePayload {
  serviceId: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  duration: number;
  severity: "P1" | "P2" | "P3" | "P4";
}
