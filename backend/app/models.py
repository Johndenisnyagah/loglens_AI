from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship
from app.database import Base


class LogFile(Base):
    __tablename__ = "log_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="uploaded")  # uploaded|processing|analyzed|failed
    total_lines = Column(Integer, default=0)
    parsed_events_count = Column(Integer, default=0)

    events = relationship("Event", back_populates="log_file", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="log_file", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    log_file_id = Column(Integer, ForeignKey("log_files.id"), nullable=False)
    timestamp = Column(String, nullable=True)
    event_type = Column(String, nullable=False)  # failed_login|successful_login|invalid_user|unknown
    username = Column(String, nullable=True)
    source_ip = Column(String, nullable=True)
    raw_message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    log_file = relationship("LogFile", back_populates="events")
    evidence_links = relationship("IncidentEvidence", back_populates="event")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    log_file_id = Column(Integer, ForeignKey("log_files.id"), nullable=False)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # low|medium|high|critical
    risk_score = Column(Integer, nullable=False)
    source_ip = Column(String, nullable=True)
    username = Column(String, nullable=True)
    detection_rule = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="open")  # open|reviewed|false_positive|resolved
    needs_human_review = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    log_file = relationship("LogFile", back_populates="incidents")
    evidence = relationship("IncidentEvidence", back_populates="incident", cascade="all, delete-orphan")
    ai_summary = relationship("AISummary", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class IncidentEvidence(Base):
    __tablename__ = "incident_evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    raw_message = Column(Text, nullable=False)

    incident = relationship("Incident", back_populates="evidence")
    event = relationship("Event", back_populates="evidence_links")


class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    recommended_actions = Column(Text, nullable=False)  # JSON array stored as string
    confidence = Column(String, nullable=False)  # low|medium|high
    model_used = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="ai_summary")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
