import { Inbox } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No data', description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F6F4] border border-[#EDECE8] flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-[#9CA3AF]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-[#374151]">{title}</p>
      {description && (
        <p className="text-sm text-[#6B7280] mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
