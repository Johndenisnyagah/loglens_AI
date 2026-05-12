import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ShieldAlert, ShieldX, Eye, TrendingUp } from 'lucide-react';
import { getIncidents } from '../api/incidents';
import type { Incident, Severity, IncidentStatus } from '../types';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

const SEVERITIES = [
  { label: 'All severities', value: '' }, { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },       { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const STATUSES = [
  { label: 'All statuses', value: '' },   { label: 'Open', value: 'open' },
  { label: 'Reviewed', value: 'reviewed' }, { label: 'False Positive', value: 'false_positive' },
  { label: 'Resolved', value: 'resolved' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function Incidents() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [severity,  setSeverity]  = useState('');
  const [status,    setStatus]    = useState('');
  const [search,    setSearch]    = useState('');

  const load = () => {
    setLoading(true); setError('');
    getIncidents({ severity: severity || undefined, status: status || undefined, search: search || undefined })
      .then(setIncidents).catch(() => setError('Could not load incidents.')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [severity, status, search]);

  // Derived stats for right panel
  const total    = incidents.length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const high     = incidents.filter(i => i.severity === 'high').length;
  const open     = incidents.filter(i => i.status === 'open').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

      {/* ── Left: table ──────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Incidents</h1>
          <p className="text-sm text-[#7A92A8] mt-0.5">All detected security incidents</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A92A8]" />
            <input type="text" placeholder="Search IP or username…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-[#F5F7FA] border border-[#EEF2F5] rounded-xl text-[#000000] placeholder:text-[#7A92A8] focus:outline-none focus:border-[#DBE3E9] focus:bg-white w-48 transition" />
          </div>
          {[{ val: severity, set: setSeverity, opts: SEVERITIES }, { val: status, set: setStatus, opts: STATUSES }].map(
            ({ val, set, opts }, i) => (
              <select key={i} value={val} onChange={(e) => set(e.target.value)}
                className="px-3 py-2 text-sm bg-[#F5F7FA] border border-[#EEF2F5] rounded-xl text-[#000000] focus:outline-none focus:border-[#DBE3E9] focus:bg-white transition appearance-none pr-8">
                {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )
          )}
        </div>

        {/* Table */}
        <div className="bg-[#F5F7FA] rounded-2xl overflow-hidden flex-1">
          {loading ? <LoadingState message="Loading incidents…" />
          : error   ? <ErrorState message={error} onRetry={load} />
          : incidents.length === 0 ? (
            <EmptyState title="No incidents found" description="Try adjusting your filters, or upload a log file." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EEF2F5] bg-[#EEF2F5]">
                  {['Severity', 'Incident', 'Source IP', 'Risk', 'Status', 'Detected'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#7A92A8] uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2F5]">
                {incidents.map((inc) => (
                  <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}
                    className="hover:bg-[#EEF2F5] cursor-pointer transition-colors group">
                    <td className="px-5 py-3.5"><SeverityBadge severity={inc.severity as Severity} /></td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#000000] line-clamp-1">{inc.title}</p>
                      <p className="text-xs text-[#7A92A8] font-mono mt-0.5">{inc.username ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#3D5166]">{inc.source_ip ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#000000] tabular-nums">{inc.risk_score}</span>
                      <span className="text-[#7A92A8] text-xs">/100</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={inc.status as IncidentStatus} /></td>
                    <td className="px-5 py-3.5 text-xs text-[#7A92A8] whitespace-nowrap">{formatDate(inc.created_at)}</td>
                    <td className="px-4 py-3.5 text-[#DBE3E9] group-hover:text-[#6AA6DA] transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && incidents.length > 0 && (
          <p className="text-xs text-[#7A92A8]">{total} incident{total !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* ── Right: stats panel ───────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Summary stats */}
        <div className="bg-[#F5F7FA] rounded-2xl p-6">
          <p className="text-xs font-bold text-[#7A92A8] uppercase tracking-widest mb-4">Summary</p>
          <div className="space-y-3">
            {[
              { icon: ShieldAlert, label: 'Total',    value: total,    color: 'text-[#000000]' },
              { icon: ShieldX,     label: 'Critical',  value: critical, color: 'text-[#000000]' },
              { icon: TrendingUp,  label: 'High',      value: high,     color: 'text-[#6AA6DA]' },
              { icon: Eye,         label: 'Open',      value: open,     color: 'text-[#6AA6DA]' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7A92A8]" strokeWidth={1.8} />
                  <span className="text-sm text-[#3D5166]">{label}</span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="bg-[#F5F7FA] rounded-2xl p-6">
          <p className="text-xs font-bold text-[#7A92A8] uppercase tracking-widest mb-4">By Severity</p>
          <div className="space-y-2.5">
            {(['critical', 'high', 'medium', 'low'] as Severity[]).map((sev) => {
              const count = incidents.filter(i => i.severity === sev).length;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={sev}>
                  <div className="flex items-center justify-between mb-1">
                    <SeverityBadge severity={sev} />
                    <span className="text-xs font-semibold text-[#000000] tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[#EEF2F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: sev === 'critical' ? '#000000' : sev === 'high' ? '#6AA6DA' : sev === 'medium' ? '#DBE3E9' : '#E1E5AC',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution status */}
        <div className="bg-[#000000] rounded-2xl p-6 flex-1">
          <p className="text-xs font-bold text-[#FBFBF8]/50 uppercase tracking-widest mb-4">Resolution</p>
          <div className="space-y-3">
            {[
              { label: 'Open',     value: open,     bg: 'bg-[#6AA6DA]' },
              { label: 'Resolved', value: resolved,  bg: 'bg-[#E1E5AC]' },
              { label: 'Other',    value: total - open - resolved, bg: 'bg-[#FBFBF8]/20' },
            ].map(({ label, value, bg }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${bg}`} />
                  <span className="text-sm text-[#FBFBF8]/70">{label}</span>
                </div>
                <span className="text-sm font-bold text-[#FBFBF8] tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
