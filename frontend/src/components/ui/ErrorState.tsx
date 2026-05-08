import { AlertTriangle } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] flex items-center justify-center mb-1">
        <AlertTriangle className="w-6 h-6 text-[#DC2626]" strokeWidth={1.5} />
      </div>
      <p className="text-sm text-[#6B7280]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-[#7C3AED] font-medium hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
