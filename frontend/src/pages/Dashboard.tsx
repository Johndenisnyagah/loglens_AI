import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldAlert, Globe } from 'lucide-react';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary, Incident } from '../types';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Dark featured incident card (matches reference dark navy card) ── */
function DarkCard({ inc, onClick }: { inc: Incident; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#000000] rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:bg-[#111111] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <SeverityBadge severity={inc.severity} />
        <span className="text-[10px] text-[#FBFBF8]/40 font-mono whitespace-nowrap">{formatDate(inc.created_at)}</span>
      </div>
      <h3 className="text-[#FBFBF8] font-bold text-lg leading-snug">{inc.title}</h3>
      <p className="text-[#FBFBF8]/60 text-xs leading-relaxed line-clamp-3">{inc.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-[#FBFBF8]/40 font-mono">{inc.source_ip ?? '—'}</span>
        <button className="flex items-center gap-1 text-xs font-semibold text-[#FBFBF8] bg-[#6AA6DA] px-3 py-1.5 rounded-lg hover:bg-[#5A96CA] transition-colors">
          View <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ── Light incident card (matches reference white card) ── */
function LightCard({ inc, onClick }: { inc: Incident; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#F5F7FA] rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:bg-[#EEF2F5] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <SeverityBadge severity={inc.severity} />
        <span className="text-[10px] text-[#7A92A8] font-mono whitespace-nowrap">{formatDate(inc.created_at)}</span>
      </div>
      <h3 className="text-[#000000] font-bold text-base leading-snug">{inc.title}</h3>
      <p className="text-[#7A92A8] text-xs leading-relaxed line-clamp-2">{inc.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-[#7A92A8] font-mono">{inc.source_ip ?? '—'}</span>
        <StatusBadge status={inc.status} />
      </div>
    </div>
  );
}

/* ── AI insight card (matches reference featured dark card with content) ── */
function AICard({ insight }: { insight: string }) {
  return (
    <div className="bg-[#DBE3E9] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#6AA6DA] flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-[#FBFBF8]" strokeWidth={2} />
        </div>
        <span className="text-xs font-bold text-[#3D5166] uppercase tracking-widest">AI Insight</span>
      </div>
      <p className="text-[#000000] text-sm leading-relaxed">{insight}</p>
    </div>
  );
}

export function Dashboard() {
  const [data, setData]       = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError('');
    getDashboardSummary()
      .then(setData)
      .catch(() => setError('Could not load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState message="Loading dashboard…" />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!data)   return null;

  const critical = data.recent_incidents.filter(i => i.severity === 'critical' || i.severity === 'high');
  const rest = data.recent_incidents.filter(i => i.severity !== 'critical' && i.severity !== 'high');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Left/Center: Feed ─────────────────────────────────────── */}
      <div className="lg:col-span-2">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#000000]">Feed</h1>
          <p className="text-sm text-[#7A92A8] mt-0.5">Security log intelligence overview</p>
        </div>

        {data.recent_incidents.length === 0 ? (
          <div className="bg-[#F5F7FA] rounded-2xl p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-[#DBE3E9] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-[#000000]">No incidents yet</p>
            <p className="text-xs text-[#7A92A8] mt-1">Upload a log file to start detecting threats</p>
            <button onClick={() => navigate('/upload')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6AA6DA] text-[#FBFBF8] text-xs font-semibold rounded-xl hover:bg-[#5A96CA] transition-colors">
              Upload logs <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First critical incident as dark featured card */}
            {critical[0] && (
              <DarkCard inc={critical[0]} onClick={() => navigate(`/incidents/${critical[0].id}`)} />
            )}

            {/* Second critical or first medium as light card */}
            {(critical[1] ?? rest[0]) && (
              <LightCard
                inc={critical[1] ?? rest[0]}
                onClick={() => navigate(`/incidents/${(critical[1] ?? rest[0]).id}`)}
              />
            )}

            {/* AI insight card spans both columns if present */}
            {data.ai_insight && (
              <div className="sm:col-span-2">
                <AICard insight={data.ai_insight} />
              </div>
            )}

            {/* Remaining incidents as light cards */}
            {data.recent_incidents.slice(2).map((inc) => (
              <LightCard key={inc.id} inc={inc} onClick={() => navigate(`/incidents/${inc.id}`)} />
            ))}
          </div>
        )}

        {data.recent_incidents.length > 0 && (
          <button onClick={() => navigate('/incidents')}
            className="mt-5 flex items-center gap-1.5 text-sm text-[#6AA6DA] font-semibold hover:underline">
            View all incidents <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* ── Right: Stats panel ──────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Profile / app stats — matches reference right panel */}
        <div className="bg-[#F5F7FA] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#000000] flex items-center justify-center text-[#FBFBF8] text-xs font-bold">LL</div>
            <div>
              <p className="text-sm font-bold text-[#000000]">LogLens AI</p>
              <p className="text-xs text-[#7A92A8]">Security Dashboard</p>
            </div>
          </div>
          {/* Stats row — mirrors reference 97 / 3.5k / 12 */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EEF2F5]">
            {[
              { label: 'Logs', value: data.total_logs },
              { label: 'Incidents', value: data.total_incidents },
              { label: 'High Risk', value: data.high_risk_incidents },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-[#000000]">{value}</p>
                <p className="text-[10px] text-[#7A92A8] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs review */}
        <div className="bg-[#F5F7FA] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-[#000000]">Needs Review</p>
            <span className="text-xs font-semibold text-[#6AA6DA] bg-[#DBE3E9] px-2 py-0.5 rounded-lg">
              {data.needs_review_count}
            </span>
          </div>
          {data.top_suspicious_ips.length === 0 ? (
            <p className="text-xs text-[#7A92A8]">No suspicious activity detected.</p>
          ) : (
            <div className="space-y-2">
              {data.top_suspicious_ips.slice(0, 4).map((ip) => (
                <div key={ip.source_ip} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#7A92A8]" strokeWidth={1.5} />
                    <span className="text-xs font-mono text-[#000000]">{ip.source_ip}</span>
                  </div>
                  <SeverityBadge severity={ip.highest_severity} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick upload CTA — matches reference "Make a boww" / "Add new" */}
        <button onClick={() => navigate('/upload')}
          className="w-full bg-[#000000] text-[#FBFBF8] rounded-2xl p-5 flex items-center justify-between hover:bg-[#111111] transition-colors group">
          <div>
            <p className="text-sm font-bold">Analyze a log</p>
            <p className="text-xs text-[#FBFBF8]/50 mt-0.5">Upload an auth.log file</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#6AA6DA] flex items-center justify-center group-hover:bg-[#5A96CA] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#FBFBF8]" strokeWidth={2.5} />
          </div>
        </button>
      </div>

    </div>
  );
}
