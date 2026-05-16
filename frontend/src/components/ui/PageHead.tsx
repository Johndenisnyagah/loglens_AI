import type { ReactNode } from 'react';

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}

export function PageHead({ eyebrow, title, subtitle, right }: Props) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <div
            className="text-[10px] font-medium uppercase mb-2.5"
            style={{ letterSpacing: '0.18em', color: 'var(--color-text-dim)' }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="text-[32px] font-semibold leading-[1.1] tracking-[-0.02em]"
          style={{ color: 'var(--color-text)', margin: 0, marginBottom: '6px' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[13px] leading-[1.5] m-0"
            style={{ color: 'var(--color-text-dim)', maxWidth: '560px' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-4 shrink-0">{right}</div>}
    </div>
  );
}
