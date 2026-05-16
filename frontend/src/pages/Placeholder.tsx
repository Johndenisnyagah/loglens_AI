import { BarChart2, FileText, Download, Clock } from 'lucide-react';

const COMING_SOON = [
  { icon: BarChart2, title: 'Incident Reports',      desc: 'Weekly and monthly security summaries with trend analysis.' },
  { icon: FileText,  title: 'Audit Log Export',      desc: 'Export full audit trails in CSV or JSON format.' },
  { icon: Download,  title: 'PDF Report Generation', desc: 'Generate formatted incident reports for stakeholders.' },
  { icon: Clock,     title: 'Scheduled Digests',     desc: 'Automated weekly email security digests.' },
];

interface Props { title: string; subtitle?: string; }

export function Placeholder({ title, subtitle }: Props) {
  return (
    <div className="flex gap-5 h-full min-h-0">

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E5EA]">{title}</h1>
          {subtitle && <p className="text-sm text-[#555D6B] mt-0.5">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMING_SOON.map(({ icon: Icon, title: t, desc }) => (
            <div key={t} className="rounded-2xl p-6 flex flex-col gap-3" style={{ backgroundColor: '#22262E' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(75,124,232,0.15)' }}>
                <Icon className="w-5 h-5 text-[#4B7CE8]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#E2E5EA]">{t}</p>
                <p className="text-xs text-[#555D6B] mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────── */}
      <div style={{ width: '240px' }}>
        <div className="rounded-2xl p-6 h-full flex flex-col justify-between" style={{ backgroundColor: '#22262E' }}>
          <div>
            <p className="text-[10px] font-bold text-[#555D6B] uppercase tracking-widest mb-3">Status</p>
            <p className="text-2xl font-bold text-[#E2E5EA] leading-snug">Coming in a future release</p>
            <p className="text-sm text-[#555D6B] mt-3 leading-relaxed">
              Reports and analytics features are actively being developed. Check back soon.
            </p>
          </div>
          <div className="mt-8 pt-5 border-t border-[#2D3340]">
            <p className="text-xs text-[#555D6B]">LogLens AI · v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
