export interface IncidentPayload {
  title: string;
  severity: "P1" | "P2" | "P3" | "P4";
  description?: string;
  serviceId?: string;
}
