import { FileText, BarChart2, Download, Clock } from 'lucide-react';

const COMING_SOON = [
  { icon: BarChart2, title: 'Incident Reports',      desc: 'Weekly and monthly security summaries with trend analysis.' },
  { icon: FileText,  title: 'Audit Log Export',      desc: 'Export full audit trails in CSV or JSON format.' },
  { icon: Download,  title: 'PDF Report Generation', desc: 'Generate formatted incident reports for stakeholders.' },
  { icon: Clock,     title: 'Scheduled Digests',     desc: 'Automated weekly email security digests.' },
];

interface Props { title: string; subtitle?: string; }

export function Placeholder({ title, subtitle }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

      {/* Left: feature preview */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">{title}</h1>
          {subtitle && <p className="text-sm text-[#7A92A8] mt-0.5">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {COMING_SOON.map(({ icon: Icon, title: t, desc }) => (
            <div key={t} className="bg-[#F5F7FA] rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6AA6DA] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#FBFBF8]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#000000]">{t}</p>
                <p className="text-xs text-[#7A92A8] mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: coming soon card */}
      <div className="flex flex-col gap-5">
        <div className="bg-[#000000] rounded-2xl p-6 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-[#FBFBF8]/50 uppercase tracking-widest mb-3">Status</p>
            <p className="text-2xl font-bold text-[#FBFBF8] leading-snug">Coming in a future release</p>
            <p className="text-sm text-[#FBFBF8]/50 mt-3 leading-relaxed">
              Reports and analytics features are actively being developed. Check back soon.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#FBFBF8]/10">
            <p className="text-xs text-[#FBFBF8]/30">LogLens AI · v1.0</p>
          </div>
        </div>
      </div>

    </div>
  );
}
