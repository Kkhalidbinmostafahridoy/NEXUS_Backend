import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="NEXUS AI Investigation Service")

class InvestigationRequest(BaseModel):
    incident_id: str
    title: str
    evidence: list[dict] = Field(default_factory=list)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "provider": os.getenv("AI_PROVIDER", "mock"),
    }


def mock_investigation(request: InvestigationRequest):
    return {
        "summary": f"Evidence review requested for incident {request.incident_id}: {request.title}",
        "rootCause": "Pending evidence analysis",
        "confidence": 0.0,
        "recommendations": [
            {
                "action": "REVIEW_RUNBOOK",
                "reason": "Confirm evidence and runbook steps with an engineer before making a change.",
                "confidence": 0.5,
            }
        ],
    }


def openai_investigation(request: InvestigationRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY is not configured")

    evidence = json.dumps(request.evidence[:20])
    prompt = (
        "You are an SRE incident-analysis assistant. Return JSON with summary, rootCause, "
        "confidence (0 to 1), and recommendations (action, reason, confidence). "
        "Do not recommend executing production changes. "
        f"Incident: {request.incident_id}; title: {request.title}; evidence: {evidence}"
    )
    body = json.dumps(
        {
            "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            "messages": [
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
        }
    ).encode()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    request_object = Request(
        f"{base_url}/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request_object, timeout=30) as response:
            payload = json.loads(response.read().decode())
        return json.loads(payload["choices"][0]["message"]["content"])
    except (HTTPError, URLError, KeyError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="AI provider request failed") from error

@app.post("/investigate")
def investigate(request: InvestigationRequest):
    if os.getenv("AI_PROVIDER", "mock").lower() == "openai":
        return openai_investigation(request)
    return mock_investigation(request)
