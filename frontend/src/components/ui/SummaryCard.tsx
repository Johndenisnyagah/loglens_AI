import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: boolean;
}

export function SummaryCard({ label, value, icon, accent }: Props) {
  return (
    <div className="bg-[#F7F6F4] border border-[#EDECE8] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
        {icon && (
          <div className={`p-2.5 rounded-xl ${accent ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-white text-[#9CA3AF] shadow-sm'}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-[#111827]">{value}</p>
    </div>
  );
}
