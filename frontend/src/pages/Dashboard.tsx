import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldAlert, ShieldX, Eye, Sparkles } from 'lucide-react';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { SummaryCard } from '../components/ui/SummaryCard';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const severityDot: Record<string, string> = {
  low:      'bg-[#4CAF7D]',
  medium:   'bg-[#D4953A]',
  high:     'bg-[#D4713A]',
  critical: 'bg-[#C94F4F]',
};

export function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Security log intelligence overview" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Logs Analyzed"      value={data.total_logs}          icon={<FileText   className="w-4 h-4" />} />
        <SummaryCard label="Total Incidents"    value={data.total_incidents}     icon={<ShieldAlert className="w-4 h-4" />} />
        <SummaryCard label="High-Risk"          value={data.high_risk_incidents} icon={<ShieldX    className="w-4 h-4" />} accent />
        <SummaryCard label="Needs Review"       value={data.needs_review_count}  icon={<Eye        className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent incidents */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F2F1EE]">
            <h2 className="text-sm font-semibold text-[#1C1C1E]">Recent Incidents</h2>
          </div>

          {data.recent_incidents.length === 0 ? (
            <EmptyState title="No incidents yet" description="Upload a log file to get started." />
          ) : (
            <div className="divide-y divide-[#F2F1EE]">
              {data.recent_incidents.slice(0, 8).map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-[#F9F8F6] transition-colors text-left"
                >
                  <SeverityBadge severity={inc.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1C1E] truncate">{inc.title}</p>
                    <p className="text-xs text-[#9A9994] mt-0.5 font-mono">{inc.source_ip ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#1C1C1E] tabular-nums">
                      {inc.risk_score}
                    </span>
                    <StatusBadge status={inc.status} />
                    <span className="text-xs text-[#C4C2BD] hidden xl:block">
                      {formatDate(inc.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {data.recent_incidents.length > 0 && (
            <div className="px-6 py-3 border-t border-[#F2F1EE]">
              <button
                onClick={() => navigate('/incidents')}
                className="text-sm text-[#5B7FD4] hover:underline font-medium"
              >
                View all incidents →
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* AI Insight */}
          {data.ai_insight && (
            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#5B7FD4]" strokeWidth={1.8} />
                <h2 className="text-sm font-semibold text-[#1C1C1E]">AI Insight</h2>
              </div>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{data.ai_insight}</p>
            </div>
          )}

          {/* Top suspicious IPs */}
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F2F1EE]">
              <h2 className="text-sm font-semibold text-[#1C1C1E]">Top Suspicious IPs</h2>
            </div>
            {data.top_suspicious_ips.length === 0 ? (
              <EmptyState title="No suspicious IPs" />
            ) : (
              <div className="divide-y divide-[#F2F1EE]">
                {data.top_suspicious_ips.map((ip) => (
                  <div
                    key={ip.source_ip}
                    className="flex items-center justify-between px-6 py-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          severityDot[ip.highest_severity] ?? 'bg-[#D4D2CD]'
                        }`}
                      />
                      <span className="text-sm font-mono text-[#1C1C1E]">{ip.source_ip}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-[#9A9994]">
                        {ip.incident_count} incident{ip.incident_count !== 1 ? 's' : ''}
                      </span>
                      <SeverityBadge severity={ip.highest_severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
