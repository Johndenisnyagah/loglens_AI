from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.services.audit import log_audit

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.delete("/reset", summary="Reset analyzer database")
def reset_database(db: Session = Depends(get_db)):
    """Delete all logs, events, incidents, evidence and AI summaries. Audit log is preserved."""
    db.query(models.AISummary).delete()
    db.query(models.IncidentEvidence).delete()
    db.query(models.Incident).delete()
    db.query(models.Event).delete()
    db.query(models.LogFile).delete()
    db.commit()
    log_audit(db, "database_reset", None, None, "All analyzer data cleared by operator")
    return {"status": "ok", "message": "Analyzer database reset successfully"}
