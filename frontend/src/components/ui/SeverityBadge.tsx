import type { Severity } from '../../types';

const styles: Record<Severity, string> = {
  low:      'bg-[#E1E5AC] text-[#000000]',           /* Pear */
  medium:   'bg-[#DBE3E9] text-[#3D5166]',           /* Mist */
  high:     'bg-[#6AA6DA] text-[#FBFBF8]',           /* Cornflower */
  critical: 'bg-[#000000] text-[#FBFBF8]',           /* Black */
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
