from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import AuditLogResponse

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=List[AuditLogResponse])
def list_audit_entries(
    action: Optional[str] = Query(None, description="Filter by action prefix, e.g. 'incident_'"),
    target_type: Optional[str] = Query(None, description="Filter by target type, e.g. 'incident' or 'log_file'"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Append-only audit log of every action LogLens performed or a user took."""
    query = db.query(models.AuditLog)

    if action:
        # prefix match (e.g. action=incident_ catches incident_created, incident_status_changed)
        query = query.filter(models.AuditLog.action.ilike(f"{action}%"))
    if target_type:
        query = query.filter(models.AuditLog.target_type == target_type)

    return query.order_by(models.AuditLog.created_at.desc()).limit(limit).all()
