import { useState } from 'react';

interface Props {
  title?: string;
  body?: React.ReactNode;
}

export function TrustBanner({
  title = 'AI is an explanation layer, not a detection layer.',
  body,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="flex items-center gap-4 text-[12px] leading-[1.55]"
      style={{
        background: 'var(--color-panel)',
        borderLeft: '2px solid var(--color-warn)',
        padding: '16px 22px',
        color: 'var(--color-text-mid)',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 font-bold"
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid var(--color-warn)',
          color: 'var(--color-warn)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.05em',
        }}
      >
        AI
      </div>
      <div>
        <strong style={{ color: 'var(--color-text)', fontWeight: 600, marginRight: '6px' }}>{title}</strong>
        {body ?? (
          <>
            Every summary is generated from incidents already flagged by deterministic rules.
            The model interprets evidence — it never decides what counts as suspicious.
            Recommended actions still require human approval.
          </>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto font-bold uppercase shrink-0"
        style={{
          background: 'transparent',
          border: '1px solid var(--color-line)',
          color: 'var(--color-text-mid)',
          padding: '6px 12px',
          fontSize: '10px',
          letterSpacing: '0.14em',
          cursor: 'pointer',
        }}
      >
        Got it
      </button>
    </div>
  );
}
