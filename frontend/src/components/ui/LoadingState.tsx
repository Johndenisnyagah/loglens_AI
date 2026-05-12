export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-[#7A92A8]">
      <span className="animate-spin inline-block w-4 h-4 border-2 border-[#DBE3E9] border-t-[#6AA6DA] rounded-full" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
