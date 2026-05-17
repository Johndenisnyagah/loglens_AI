import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';

const DROP_STYLES = `
@keyframes pill-drop {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

interface Props {
  children: ReactNode;
  options?: string[];
  value?: string;
  onChange?: (v: string) => void;
  onClick?: () => void;
}

export function PillFilter({ children, options, value, onChange, onClick }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Simple button — no dropdown
  if (!options) {
    return (
      <button
        onClick={onClick}
        style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        14,
          background: 'transparent',
          border:     '1px solid var(--color-line)',
          padding:    '9px 14px',
          color:      'var(--color-text-mid)',
          fontSize:   12,
          cursor:     'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span>{children}</span>
        <ChevronDown size={10} strokeWidth={2.5} style={{ color: 'var(--color-text-dim)' }} />
      </button>
    );
  }

  const active = value && value !== options[0];

  return (
    <>
      <style>{DROP_STYLES}</style>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        14,
            background: active ? 'rgba(75,108,246,0.08)' : open ? 'var(--color-card)' : 'transparent',
            border:     `1px solid ${open || active ? 'var(--color-accent)' : 'var(--color-line)'}`,
            padding:    '9px 14px',
            color:      open || active ? 'var(--color-text)' : 'var(--color-text-mid)',
            fontSize:   12,
            cursor:     'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.12s, background 0.12s, color 0.12s',
          }}
        >
          <span>{value ?? children}</span>
          <ChevronDown
            size={10}
            strokeWidth={2.5}
            style={{
              color:      'var(--color-text-dim)',
              transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              flexShrink: 0,
            }}
          />
        </button>

        {open && (
          <div
            style={{
              position:  'absolute',
              top:       'calc(100% + 6px)',
              left:      0,
              background: 'var(--color-panel)',
              border:    '1px solid var(--color-line)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
              zIndex:    200,
              minWidth:  '170px',
              animation: 'pill-drop 0.12s ease',
            }}
          >
            {options.map((opt) => {
              const selected = opt === value;
              return (
                <button
                  key={opt}
                  onClick={() => { onChange?.(opt); setOpen(false); }}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    gap:            10,
                    width:          '100%',
                    padding:        '10px 14px',
                    background:     selected ? 'rgba(75,108,246,0.08)' : 'none',
                    border:         'none',
                    color:          selected ? 'var(--color-text)' : 'var(--color-text-mid)',
                    fontSize:       12,
                    cursor:         'pointer',
                    fontFamily:     'inherit',
                    textAlign:      'left',
                    transition:     'background 0.1s, color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = selected ? 'rgba(75,108,246,0.12)' : 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selected ? 'rgba(75,108,246,0.08)' : 'none';
                    e.currentTarget.style.color = selected ? 'var(--color-text)' : 'var(--color-text-mid)';
                  }}
                >
                  {opt}
                  {selected && <Check size={11} strokeWidth={2.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
