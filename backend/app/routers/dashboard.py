from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import DashboardSummaryResponse, IncidentResponse, SuspiciousIP

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

SEVERITY_ORDER = {"low": 0, "medium": 1, "high": 2, "critical": 3}


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    hours: int = Query(0, ge=0, description="Time window in hours; 0 = all time"),
    log_file_id: int | None = Query(None, description="Filter to a specific log file (host)"),
):
    cutoff = datetime.utcnow() - timedelta(hours=hours) if hours > 0 else None

    def inc_q():
        q = db.query(models.Incident)
        if cutoff is not None:
            q = q.filter(models.Incident.created_at >= cutoff)
        if log_file_id is not None:
            q = q.filter(models.Incident.log_file_id == log_file_id)
        return q

    log_q = db.query(models.LogFile)
    if cutoff is not None:
        log_q = log_q.filter(models.LogFile.uploaded_at >= cutoff)
    if log_file_id is not None:
        log_q = log_q.filter(models.LogFile.id == log_file_id)

    total_logs = log_q.count()
    total_incidents = inc_q().count()

    high_risk_incidents = (
        inc_q()
        .filter(models.Incident.severity.in_(["high", "critical"]))
        .count()
    )

    needs_review_count = (
        inc_q()
        .filter(models.Incident.needs_human_review == True, models.Incident.status == "open")  # noqa: E712
        .count()
    )

    recent_incidents = (
        inc_q()
        .order_by(models.Incident.created_at.desc())
        .limit(10)
        .all()
    )

    # Top suspicious IPs — group incidents by source_ip
    all_incidents = inc_q().filter(models.Incident.source_ip.isnot(None)).all()

    ip_data: dict[str, dict] = defaultdict(lambda: {"count": 0, "severities": []})
    for inc in all_incidents:
        ip = inc.source_ip
        ip_data[ip]["count"] += 1
        ip_data[ip]["severities"].append(inc.severity)

    top_ips = sorted(ip_data.items(), key=lambda x: x[1]["count"], reverse=True)[:5]
    suspicious_ips = [
        SuspiciousIP(
            source_ip=ip,
            incident_count=data["count"],
            highest_severity=max(data["severities"], key=lambda s: SEVERITY_ORDER.get(s, 0)),
        )
        for ip, data in top_ips
    ]

    # AI insight — pull the first AI summary available from recent incidents
    ai_insight: str | None = None
    for inc in recent_incidents:
        ai_sum = db.query(models.AISummary).filter(models.AISummary.incident_id == inc.id).first()
        if ai_sum:
            ai_insight = ai_sum.summary
            break

    return DashboardSummaryResponse(
        total_logs=total_logs,
        total_incidents=total_incidents,
        high_risk_incidents=high_risk_incidents,
        needs_review_count=needs_review_count,
        recent_incidents=[IncidentResponse.model_validate(i) for i in recent_incidents],
        top_suspicious_ips=suspicious_ips,
        ai_insight=ai_insight,
    )
