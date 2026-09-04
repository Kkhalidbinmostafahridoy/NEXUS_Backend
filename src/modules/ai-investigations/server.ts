import { NexusService } from "../nexus";
export class AiInvestigationsServer {
  constructor(private readonly nexus: NexusService) {}
  investigate(id: string) {
    return this.nexus.investigate(id);
  }
  list(id: string) {
    return this.nexus.investigations(id);
  }
  get(id: string) {
    return this.nexus.investigation(id);
  }
}
