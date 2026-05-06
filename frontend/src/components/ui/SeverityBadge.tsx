import type { Severity } from '../../types';

const styles: Record<Severity, string> = {
  low: 'bg-[#F0FBF4] text-[#2E7D52] border-[#B6E8C8]',
  medium: 'bg-[#FEF9EB] text-[#9A6B1A] border-[#F5D98A]',
  high: 'bg-[#FEF3EB] text-[#9A4E1A] border-[#F5C39A]',
  critical: 'bg-[#FEF0F0] text-[#9A2323] border-[#F5AAAA]',
};

interface Props {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${styles[severity]} ${className}`}
    >
      {severity}
    </span>
  );
}
