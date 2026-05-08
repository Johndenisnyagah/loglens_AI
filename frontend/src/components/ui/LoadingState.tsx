export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-[#6B7280]">
      <span className="animate-spin inline-block w-4 h-4 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
