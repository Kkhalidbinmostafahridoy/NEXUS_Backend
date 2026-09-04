from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="NEXUS AI Investigation Service")

class InvestigationRequest(BaseModel):
    incident_id: str
    title: str
    evidence: list[dict] = Field(default_factory=list)

@app.get("/health")
def health(): return {"status": "ok"}

@app.post("/investigate")
def investigate(request: InvestigationRequest):
    # This safe baseline never performs a production action; NEXUS requires engineer approval.
    return {"summary": f"Evidence review requested for incident {request.incident_id}: {request.title}", "rootCause": "Pending evidence analysis", "confidence": 0.0, "recommendations": [{"action": "REVIEW_RUNBOOK", "reason": "Confirm evidence and runbook steps with an engineer before making a change.", "confidence": 0.5}]}
