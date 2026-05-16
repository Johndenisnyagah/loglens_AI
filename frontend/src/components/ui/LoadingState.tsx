export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3" style={{ color: 'var(--color-text-dim)' }}>
      <span
        className="animate-spin inline-block w-4 h-4 rounded-full"
        style={{ border: '2px solid var(--color-line)', borderTopColor: 'var(--color-accent)' }}
      />
      <span className="text-sm">{message}</span>
    </div>
  );
}
