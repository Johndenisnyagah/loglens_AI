import { AlertTriangle } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div
        className="flex items-center justify-center"
        style={{ width: '56px', height: '56px', backgroundColor: 'rgba(239,91,107,0.12)' }}
      >
        <AlertTriangle size={24} strokeWidth={1.5} style={{ color: 'var(--color-danger)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-mid)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-accent)' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
