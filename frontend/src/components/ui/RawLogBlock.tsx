interface Props {
  lines: string[];
  maxVisible?: number;
}

export function RawLogBlock({ lines, maxVisible = 10 }: Props) {
  const visible = lines.slice(0, maxVisible);
  const hidden  = lines.length - visible.length;

  return (
    <div className="bg-[#111827] rounded-2xl overflow-hidden">
      <pre className="text-xs font-mono text-[#D1D5DB] p-5 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {visible.join('\n')}
        {hidden > 0 && (
          <span className="block mt-2 text-[#6B7280]">
            … and {hidden} more line{hidden !== 1 ? 's' : ''}
          </span>
        )}
      </pre>
    </div>
  );
}
