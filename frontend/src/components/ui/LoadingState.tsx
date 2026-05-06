export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-[#9A9994]">
      <span className="animate-spin inline-block w-4 h-4 border-2 border-[#D4D2CD] border-t-[#5B7FD4] rounded-full" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
