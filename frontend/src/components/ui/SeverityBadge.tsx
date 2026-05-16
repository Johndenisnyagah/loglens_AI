import type { Severity } from '../../types';

const PALETTE: Record<Severity, { color: string; bg: string; border?: string }> = {
  low:      { color: 'var(--color-sev-low)',      bg: 'var(--color-sev-low-bg)',      border: 'rgba(181,186,196,0.30)' },
  medium:   { color: 'var(--color-sev-medium)',   bg: 'var(--color-sev-medium-bg)',   border: 'rgba(75,108,246,0.35)'  },
  high:     { color: 'var(--color-sev-high)',     bg: 'var(--color-sev-high-bg)',     border: 'rgba(240,138,75,0.35)'  },
  critical: { color: 'var(--color-sev-critical)', bg: 'var(--color-sev-crit-bg)',     border: 'rgba(239,91,107,0.35)'  },
};

interface Props {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: Props) {
  const p = PALETTE[severity];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase ${className}`}
      style={{
        color: p.color,
        backgroundColor: p.bg,
        border: `1px solid ${p.border}`,
        padding: '4px 8px',
        letterSpacing: '0.14em',
      }}
    >
      {severity}
    </span>
  );
}
