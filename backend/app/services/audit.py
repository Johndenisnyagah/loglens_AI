from typing import Optional
from sqlalchemy.orm import Session
from app import models


def log_audit(
    db: Session,
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    details: Optional[str] = None,
) -> None:
    entry = models.AuditLog(
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
    )
    db.add(entry)
    db.commit()
