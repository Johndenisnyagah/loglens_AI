import { Inbox } from 'lucide-react';

interface Props { title?: string; description?: string; }

export function EmptyState({ title = 'No data', description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <Inbox className="w-5 h-5 text-[#555D6B]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-[#E2E5EA]">{title}</p>
      {description && <p className="text-xs text-[#555D6B] mt-1.5 max-w-xs leading-relaxed">{description}</p>}
    </div>
  );
}
