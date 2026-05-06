import { Inbox } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No data', description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="w-9 h-9 text-[#D4D2CD] mb-3" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#6B6B6B]">{title}</p>
      {description && (
        <p className="text-sm text-[#9A9994] mt-1 max-w-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
