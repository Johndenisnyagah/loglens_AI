import type { IncidentStatus } from '../../types';

const STYLES: Record<IncidentStatus, { color: string; bg: string; label: string; border: string }> = {
  open:           { color: 'var(--color-accent)',  bg: 'rgba(75,108,246,0.12)', border: 'rgba(75,108,246,0.35)', label: 'Open'           },
  reviewed:       { color: 'var(--color-success)', bg: 'rgba(93,211,158,0.10)', border: 'rgba(93,211,158,0.35)', label: 'Reviewed'       },
  false_positive: { color: 'var(--color-text-dim)',bg: 'rgba(107,114,131,0.12)',border: 'rgba(107,114,131,0.35)',label: 'False positive' },
  resolved:       { color: 'var(--color-text)',    bg: 'rgba(230,232,236,0.06)',border: 'rgba(230,232,236,0.20)',label: 'Resolved'       },
};

interface Props {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase ${className}`}
      style={{
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        padding: '4px 8px',
        letterSpacing: '0.14em',
      }}
    >
      {s.label}
    </span>
  );
}
