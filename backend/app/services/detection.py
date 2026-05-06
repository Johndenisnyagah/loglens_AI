from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

from app.services.parser import ParsedEvent

SENSITIVE_USERNAMES = {
    "root", "admin", "administrator", "ubuntu", "test",
    "oracle", "postgres", "deploy", "user", "guest",
}


@dataclass
class DetectedIncident:
    log_file_id: int
    title: str
    severity: str
    risk_score: int
    source_ip: Optional[str]
    username: Optional[str]
    detection_rule: str
    description: str
    needs_human_review: bool
    evidence_messages: list[str] = field(default_factory=list)


def _cap(score: float) -> int:
    return min(100, max(0, int(score)))


def _severity_from_score(score: int) -> str:
    if score >= 86:
        return "critical"
    if score >= 61:
        return "high"
    if score >= 31:
        return "medium"
    return "low"


def run_detection_rules(events: list[ParsedEvent], log_file_id: int) -> list[DetectedIncident]:
    incidents: list[DetectedIncident] = []

    # Group events by source IP
    by_ip: dict[str, list[ParsedEvent]] = defaultdict(list)
    for ev in events:
        if ev.source_ip:
            by_ip[ev.source_ip].append(ev)

    for ip, ip_events in by_ip.items():
        failed = [e for e in ip_events if e.event_type in ("failed_login", "invalid_user")]
        successful = [e for e in ip_events if e.event_type == "successful_login"]
        usernames = {e.username for e in ip_events if e.username}
        sensitive_targeted = usernames & SENSITIVE_USERNAMES
        failed_count = len(failed)
        has_success = len(successful) > 0

        # ── Rule 1: Brute-force ───────────────────────────────────────────────
        if failed_count >= 5:
            if failed_count >= 25:
                base = 90
            elif failed_count >= 10:
                base = 75
            else:
                base = 55

            score = _cap(
                base
                + min(failed_count * 0.5, 15)
                + (5 if sensitive_targeted else 0)
                + (10 if has_success else 0)
            )
            severity = _severity_from_score(score)
            evidence = [e.raw_message for e in failed[:20]]

            incidents.append(DetectedIncident(
                log_file_id=log_file_id,
                title="Possible SSH brute-force attack",
                severity=severity,
                risk_score=score,
                source_ip=ip,
                username=next(iter(sensitive_targeted), next(iter(usernames), None)),
                detection_rule="brute_force_failed_logins",
                description=(
                    f"Multiple failed SSH login attempts were detected from {ip}. "
                    f"{failed_count} failed attempt(s) recorded."
                ),
                needs_human_review=True,
                evidence_messages=evidence,
            ))

        # ── Rule 2: Sensitive username targeting ──────────────────────────────
        if sensitive_targeted:
            is_high = failed_count >= 10
            base = 75 if is_high else 50
            score = _cap(base + (10 if has_success else 0))
            severity = _severity_from_score(score)
            evidence = [
                e.raw_message for e in ip_events
                if e.username in sensitive_targeted
            ][:20]

            incidents.append(DetectedIncident(
                log_file_id=log_file_id,
                title="Sensitive username targeted",
                severity=severity,
                risk_score=score,
                source_ip=ip,
                username=", ".join(sorted(sensitive_targeted)),
                detection_rule="sensitive_username_targeted",
                description=(
                    f"Login attempts from {ip} targeted sensitive usernames: "
                    f"{', '.join(sorted(sensitive_targeted))}."
                ),
                needs_human_review=True,
                evidence_messages=evidence,
            ))

        # ── Rule 3: Successful login after repeated failures ──────────────────
        if failed_count >= 5 and has_success:
            score = _cap(90 + min(failed_count * 0.3, 10))
            evidence = [e.raw_message for e in failed[:15]] + [e.raw_message for e in successful]

            incidents.append(DetectedIncident(
                log_file_id=log_file_id,
                title="Successful login after repeated failures",
                severity="critical",
                risk_score=score,
                source_ip=ip,
                username=successful[0].username if successful else None,
                detection_rule="successful_login_after_failures",
                description=(
                    f"Source IP {ip} made {failed_count} failed login attempt(s) "
                    "followed by a successful login. This may indicate account compromise."
                ),
                needs_human_review=True,
                evidence_messages=evidence[:20],
            ))

        # ── Rule 4: Username enumeration ──────────────────────────────────────
        if len(usernames) >= 5:
            score = _cap(70 + min(len(usernames) * 1.5, 15))
            evidence = [e.raw_message for e in ip_events[:20]]

            incidents.append(DetectedIncident(
                log_file_id=log_file_id,
                title="Username enumeration detected",
                severity="high",
                risk_score=score,
                source_ip=ip,
                username=None,
                detection_rule="username_enumeration",
                description=(
                    f"Source IP {ip} attempted authentication against "
                    f"{len(usernames)} different username(s), suggesting account discovery."
                ),
                needs_human_review=True,
                evidence_messages=evidence,
            ))

    return incidents
