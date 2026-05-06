from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import models
from app.database import get_db
from app.schemas import IncidentDetailResponse, IncidentResponse, StatusUpdateRequest
from app.services.audit import log_audit

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Incident)

    if severity:
        query = query.filter(func.lower(models.Incident.severity) == severity.lower())
    if status:
        query = query.filter(func.lower(models.Incident.status) == status.lower())
    if search:
        term = f"%{search}%"
        query = query.filter(
            models.Incident.source_ip.ilike(term)
            | models.Incident.username.ilike(term)
        )

    return query.order_by(models.Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = (
        db.query(models.Incident)
        .options(
            joinedload(models.Incident.evidence),
            joinedload(models.Incident.ai_summary),
        )
        .filter(models.Incident.id == incident_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    body: StatusUpdateRequest,
    db: Session = Depends(get_db),
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = incident.status
    incident.status = body.status
    db.commit()
    db.refresh(incident)

    log_audit(
        db,
        "incident_status_changed",
        "incident",
        incident_id,
        f"Status changed from {old_status} to {body.status}",
    )
    return incident
