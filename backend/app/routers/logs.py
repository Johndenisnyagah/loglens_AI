import os
import re
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.schemas import LogFileResponse, UploadResult
from app.services.audit import log_audit
from app.services.detection import run_detection_rules
from app.services.parser import parse_log_file
from app.services.ai_service import generate_ai_summary

router = APIRouter(prefix="/api/logs", tags=["logs"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".log", ".txt"}


def _sanitize_filename(filename: str) -> str:
    name = os.path.basename(filename)
    name = re.sub(r"[^\w.\-]", "_", name)
    return name[:200]


@router.get("", response_model=List[LogFileResponse])
def list_log_files(db: Session = Depends(get_db)):
    return db.query(models.LogFile).order_by(models.LogFile.uploaded_at.desc()).all()


@router.get("/{log_file_id}", response_model=LogFileResponse)
def get_log_file(log_file_id: int, db: Session = Depends(get_db)):
    log_file = db.query(models.LogFile).filter(models.LogFile.id == log_file_id).first()
    if not log_file:
        raise HTTPException(status_code=404, detail="Log file not found")
    return log_file


@router.post("/upload", response_model=UploadResult)
async def upload_log_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # ── Validate extension ────────────────────────────────────────────────────
    original_name = file.filename or "unknown"
    ext = os.path.splitext(original_name)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only .log and .txt are accepted.",
        )

    # ── Read and size-check ───────────────────────────────────────────────────
    raw_bytes = await file.read()
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(raw_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds the 10 MB size limit.")

    safe_name = _sanitize_filename(original_name)

    # ── Create LogFile record (status=uploaded) ───────────────────────────────
    log_file = models.LogFile(
        filename=safe_name,
        file_type=ext.lstrip("."),
        status="uploaded",
    )
    db.add(log_file)
    db.commit()
    db.refresh(log_file)
    log_audit(db, "file_uploaded", "log_file", log_file.id, f"Uploaded: {safe_name}")

    try:
        content = raw_bytes.decode("utf-8", errors="replace")
        total_lines = len(content.splitlines())

        # ── Parse ─────────────────────────────────────────────────────────────
        log_file.status = "processing"
        db.commit()

        parsed_events = parse_log_file(content)

        db_events: list[models.Event] = []
        for pe in parsed_events:
            ev = models.Event(
                log_file_id=log_file.id,
                timestamp=pe.timestamp,
                event_type=pe.event_type,
                username=pe.username,
                source_ip=pe.source_ip,
                raw_message=pe.raw_message,
            )
            db.add(ev)
            db_events.append(ev)

        log_file.total_lines = total_lines
        log_file.parsed_events_count = len(parsed_events)
        db.commit()

        # Refresh events to get their IDs
        for ev in db_events:
            db.refresh(ev)

        log_audit(db, "file_parsed", "log_file", log_file.id,
                  f"Parsed {len(parsed_events)} events from {total_lines} lines")

        # ── Detect ────────────────────────────────────────────────────────────
        detected = run_detection_rules(parsed_events, log_file.id)

        # Build a quick lookup: raw_message → db Event id
        msg_to_event_id: dict[str, int] = {ev.raw_message: ev.id for ev in db_events}

        incidents_created = 0
        for di in detected:
            incident = models.Incident(
                log_file_id=log_file.id,
                title=di.title,
                severity=di.severity,
                risk_score=di.risk_score,
                source_ip=di.source_ip,
                username=di.username,
                detection_rule=di.detection_rule,
                description=di.description,
                needs_human_review=di.needs_human_review,
            )
            db.add(incident)
            db.commit()
            db.refresh(incident)

            for raw_msg in di.evidence_messages:
                ev_id = msg_to_event_id.get(raw_msg)
                evidence = models.IncidentEvidence(
                    incident_id=incident.id,
                    event_id=ev_id,
                    raw_message=raw_msg,
                )
                db.add(evidence)

            db.commit()
            log_audit(db, "incident_created", "incident", incident.id,
                      f"Rule: {di.detection_rule}, severity: {di.severity}")

            # ── AI summary ────────────────────────────────────────────────────
            try:
                summary_data = generate_ai_summary({
                    "title": di.title,
                    "severity": di.severity,
                    "risk_score": di.risk_score,
                    "source_ip": di.source_ip,
                    "username": di.username,
                    "detection_rule": di.detection_rule,
                    "event_count": len(di.evidence_messages),
                    "evidence_lines": di.evidence_messages[:20],
                })
                ai_summary = models.AISummary(
                    incident_id=incident.id,
                    summary=summary_data.summary,
                    why_it_matters=summary_data.why_it_matters,
                    recommended_actions=summary_data.recommended_actions_json,
                    confidence=summary_data.confidence,
                    model_used=summary_data.model_used,
                )
                db.add(ai_summary)
                db.commit()
                log_audit(db, "ai_summary_generated", "incident", incident.id,
                          f"Model: {summary_data.model_used or 'mock'}")
            except Exception:
                # AI failure must never break incident creation
                pass

            incidents_created += 1

        # ── Finalize ──────────────────────────────────────────────────────────
        log_file.status = "analyzed"
        db.commit()
        log_audit(db, "file_analyzed", "log_file", log_file.id,
                  f"Created {incidents_created} incidents")

    except HTTPException:
        raise
    except Exception as exc:
        log_file.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}")

    return UploadResult(
        log_file_id=log_file.id,
        filename=safe_name,
        total_lines=total_lines,
        parsed_events_count=len(parsed_events),
        incidents_created=incidents_created,
        status="analyzed",
    )
