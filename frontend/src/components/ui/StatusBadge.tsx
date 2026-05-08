import type { IncidentStatus } from '../../types';

const styles: Record<IncidentStatus, string> = {
  open:           'bg-[#EDE9FE] text-[#7C3AED] ring-1 ring-[#7C3AED]/20',
  reviewed:       'bg-[#F0FDF4] text-[#16A34A] ring-1 ring-[#16A34A]/20',
  false_positive: 'bg-[#F3F4F6] text-[#6B7280] ring-1 ring-[#6B7280]/20',
  resolved:       'bg-[#F3F4F6] text-[#374151] ring-1 ring-[#374151]/20',
};

const labels: Record<IncidentStatus, string> = {
  open:           'Open',
  reviewed:       'Reviewed',
  false_positive: 'False Positive',
  resolved:       'Resolved',
};

interface Props {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${styles[status]} ${className}`}>
      {labels[status]}
    </span>
  );
}
