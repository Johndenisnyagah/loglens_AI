interface Props {
  lines: string[];
  maxVisible?: number;
}

export function RawLogBlock({ lines, maxVisible = 10 }: Props) {
  const visible = lines.slice(0, maxVisible);
  const hidden  = lines.length - visible.length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0F1117' }}>
      <pre
        className="text-xs text-[#8A909C] p-5 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {visible.join('\n')}
        {hidden > 0 && (
          <span className="block mt-2 text-[#555D6B]">
            … and {hidden} more line{hidden !== 1 ? 's' : ''}
          </span>
        )}
      </pre>
    </div>
  );
}
