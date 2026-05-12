import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: boolean;
}

export function SummaryCard({ label, value, icon, accent }: Props) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? 'bg-[#6AA6DA]' : 'bg-[#F5F7FA]'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold ${accent ? 'text-[#FBFBF8]/80' : 'text-[#7A92A8]'}`}>{label}</p>
        {icon && (
          <div className={`p-2 rounded-xl ${accent ? 'bg-[#FBFBF8]/20 text-[#FBFBF8]' : 'bg-white text-[#7A92A8]'}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-[#FBFBF8]' : 'text-[#000000]'}`}>{value}</p>
    </div>
  );
}
