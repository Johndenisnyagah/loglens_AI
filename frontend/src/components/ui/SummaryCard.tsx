import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: boolean;
}

export function SummaryCard({ label, value, icon, accent }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[#9A9994]">{label}</p>
        {icon && (
          <div
            className={`p-2 rounded-xl ${
              accent
                ? 'bg-[#EEF2FF] text-[#5B7FD4]'
                : 'bg-[#F2F1EE] text-[#9A9994]'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-[#1C1C1E]">{value}</p>
    </div>
  );
}
