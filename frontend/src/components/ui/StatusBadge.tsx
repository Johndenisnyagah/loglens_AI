import type { IncidentStatus } from '../../types';

const styles: Record<IncidentStatus, string> = {
  open:           'bg-[#6AA6DA] text-[#FBFBF8]',     /* Cornflower */
  reviewed:       'bg-[#E1E5AC] text-[#000000]',     /* Pear */
  false_positive: 'bg-[#DBE3E9] text-[#3D5166]',     /* Mist */
  resolved:       'bg-[#000000] text-[#FBFBF8]',     /* Black */
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
