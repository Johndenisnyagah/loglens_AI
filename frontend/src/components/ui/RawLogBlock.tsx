interface Props {
  lines: string[];
  maxVisible?: number;
}

export function RawLogBlock({ lines, maxVisible = 10 }: Props) {
  const visible = lines.slice(0, maxVisible);
  const hidden = lines.length - visible.length;

  return (
    <div className="bg-[#F7F6F3] rounded-xl overflow-hidden">
      <pre className="text-xs font-mono text-[#525252] p-5 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {visible.join('\n')}
        {hidden > 0 && (
          <span className="block mt-2 text-[#9A9994]">
            … and {hidden} more line{hidden !== 1 ? 's' : ''}
          </span>
        )}
      </pre>
    </div>
  );
}
