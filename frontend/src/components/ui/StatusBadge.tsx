import type { IncidentStatus } from '../../types';

const styles: Record<IncidentStatus, string> = {
  open: 'bg-[#EEF2FF] text-[#3B4FD4] border-[#C7D2FE]',
  reviewed: 'bg-[#F0FBF4] text-[#2E7D52] border-[#B6E8C8]',
  false_positive: 'bg-[#F5F5F3] text-[#737373] border-[#E1E1DC]',
  resolved: 'bg-[#F5F5F3] text-[#525252] border-[#D4D4D0]',
};

const labels: Record<IncidentStatus, string> = {
  open: 'Open',
  reviewed: 'Reviewed',
  false_positive: 'False Positive',
  resolved: 'Resolved',
};

interface Props {
  status: IncidentStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
