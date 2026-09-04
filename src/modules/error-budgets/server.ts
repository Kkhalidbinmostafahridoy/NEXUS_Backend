import { NexusService } from "../nexus";
export class ErrorBudgetsServer {
  constructor(private readonly nexus: NexusService) {}
  get(sloId: string) {
    return this.nexus.sloDetail(sloId, "error-budget");
  }
}
