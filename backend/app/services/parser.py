import re
from dataclasses import dataclass
from typing import Optional

# Matches: "May  5 02:10:11" or "May 05 02:10:11"
_TIMESTAMP_RE = re.compile(
    r"^(?P<month>[A-Za-z]+)\s+(?P<day>\d{1,2})\s+(?P<time>\d{2}:\d{2}:\d{2})"
)

# sshd auth patterns
_FAILED_INVALID_USER_RE = re.compile(
    r"Failed password for invalid user (?P<user>\S+) from (?P<ip>[\d.]+)"
)
_FAILED_RE = re.compile(
    r"Failed password for (?P<user>\S+) from (?P<ip>[\d.]+)"
)
_INVALID_USER_RE = re.compile(
    r"Invalid user (?P<user>\S+) from (?P<ip>[\d.]+)"
)
_ACCEPTED_RE = re.compile(
    r"Accepted (?:password|publickey) for (?P<user>\S+) from (?P<ip>[\d.]+)"
)


@dataclass
class ParsedEvent:
    timestamp: Optional[str]
    event_type: str  # failed_login | successful_login | invalid_user | unknown
    username: Optional[str]
    source_ip: Optional[str]
    raw_message: str


def _extract_timestamp(line: str) -> Optional[str]:
    m = _TIMESTAMP_RE.match(line)
    if m:
        return f"{m.group('month')} {m.group('day')} {m.group('time')}"
    return None


def parse_log_file(content: str) -> list[ParsedEvent]:
    events: list[ParsedEvent] = []

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        timestamp = _extract_timestamp(line)
        event: ParsedEvent

        # Order matters — check "invalid user" variant of "Failed password" first
        if m := _FAILED_INVALID_USER_RE.search(line):
            event = ParsedEvent(
                timestamp=timestamp,
                event_type="failed_login",
                username=m.group("user"),
                source_ip=m.group("ip"),
                raw_message=line,
            )
        elif m := _FAILED_RE.search(line):
            event = ParsedEvent(
                timestamp=timestamp,
                event_type="failed_login",
                username=m.group("user"),
                source_ip=m.group("ip"),
                raw_message=line,
            )
        elif m := _INVALID_USER_RE.search(line):
            event = ParsedEvent(
                timestamp=timestamp,
                event_type="invalid_user",
                username=m.group("user"),
                source_ip=m.group("ip"),
                raw_message=line,
            )
        elif m := _ACCEPTED_RE.search(line):
            event = ParsedEvent(
                timestamp=timestamp,
                event_type="successful_login",
                username=m.group("user"),
                source_ip=m.group("ip"),
                raw_message=line,
            )
        else:
            # Keep unknown lines for completeness but don't use them in detection
            continue

        events.append(event)

    return events
