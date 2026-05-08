import type { Severity } from '../../types';

const styles: Record<Severity, string> = {
  low:      'bg-[#F0FDF4] text-[#16A34A] ring-1 ring-[#16A34A]/20',
  medium:   'bg-[#FFFBEB] text-[#D97706] ring-1 ring-[#D97706]/20',
  high:     'bg-[#FFF7ED] text-[#EA580C] ring-1 ring-[#EA580C]/20',
  critical: 'bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#DC2626]/20',
};

interface Props {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize ${styles[severity]} ${className}`}>
      {severity}
    </span>
  );
}
