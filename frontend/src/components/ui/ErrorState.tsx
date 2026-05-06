import { AlertTriangle } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <AlertTriangle className="w-8 h-8 text-[#C94F4F]" strokeWidth={1.5} />
      <p className="text-sm text-[#6B6B6B]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-[#5B7FD4] hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
