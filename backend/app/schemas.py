from __future__ import annotations
import json
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# ── LogFile ──────────────────────────────────────────────────────────────────

class LogFileResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    uploaded_at: datetime
    status: str
    total_lines: int
    parsed_events_count: int

    model_config = {"from_attributes": True}


# ── AISummary ─────────────────────────────────────────────────────────────────

class AISummaryResponse(BaseModel):
    id: int
    incident_id: int
    summary: str
    why_it_matters: str
    recommended_actions: list[str]
    confidence: str
    model_used: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("recommended_actions", mode="before")
    @classmethod
    def parse_actions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        return v


# ── Incident ──────────────────────────────────────────────────────────────────

class EvidenceResponse(BaseModel):
    id: int
    raw_message: str

    model_config = {"from_attributes": True}


class IncidentResponse(BaseModel):
    id: int
    log_file_id: int
    title: str
    severity: str
    risk_score: int
    source_ip: Optional[str]
    username: Optional[str]
    detection_rule: str
    description: str
    status: str
    needs_human_review: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class IncidentDetailResponse(IncidentResponse):
    evidence: list[EvidenceResponse]
    ai_summary: Optional[AISummaryResponse]


# ── Dashboard ─────────────────────────────────────────────────────────────────

class SuspiciousIP(BaseModel):
    source_ip: str
    incident_count: int
    highest_severity: str


class DashboardSummaryResponse(BaseModel):
    total_logs: int
    total_incidents: int
    high_risk_incidents: int
    needs_review_count: int
    recent_incidents: list[IncidentResponse]
    top_suspicious_ips: list[SuspiciousIP]
    ai_insight: Optional[str]


# ── Status update ─────────────────────────────────────────────────────────────

ALLOWED_STATUSES = {"open", "reviewed", "false_positive", "resolved"}


class StatusUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(f"status must be one of {ALLOWED_STATUSES}")
        return v


# ── Upload result ─────────────────────────────────────────────────────────────

class UploadResult(BaseModel):
    log_file_id: int
    filename: str
    total_lines: int
    parsed_events_count: int
    incidents_created: int
    status: str


# ── Audit log ─────────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    details: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
