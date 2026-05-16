import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
}

export function PillFilter({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 font-family-inherit"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-line)',
        padding: '9px 14px',
        color: 'var(--color-text-mid)',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      <span>{children}</span>
      <ChevronDown size={10} strokeWidth={2.5} style={{ color: 'var(--color-text-dim)' }} />
    </button>
  );
}
