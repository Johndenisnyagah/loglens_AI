import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { getIncidents } from '../api/incidents';
import type { Incident, Severity, IncidentStatus } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

const SEVERITIES = [
  { label: 'All severities', value: '' },
  { label: 'Critical',       value: 'critical' },
  { label: 'High',           value: 'high' },
  { label: 'Medium',         value: 'medium' },
  { label: 'Low',            value: 'low' },
];

const STATUSES = [
  { label: 'All statuses',   value: '' },
  { label: 'Open',           value: 'open' },
  { label: 'Reviewed',       value: 'reviewed' },
  { label: 'False Positive', value: 'false_positive' },
  { label: 'Resolved',       value: 'resolved' },
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
    setLoading(true);
    setError('');
    getIncidents({ severity: severity || undefined, status: status || undefined, search: search || undefined })
      .then(setIncidents)
      .catch(() => setError('Could not load incidents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [severity, status, search]);

  return (
    <div>
      <PageHeader title="Incidents" subtitle="All detected security incidents" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search IP or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-[#F7F6F4] border border-[#EDECE8] rounded-xl text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white w-52 transition"
          />
        </div>

        {[{ val: severity, set: setSeverity, opts: SEVERITIES }, { val: status, set: setStatus, opts: STATUSES }].map(
          ({ val, set, opts }, i) => (
            <select
              key={i} value={val} onChange={(e) => set(e.target.value)}
              className="px-3 py-2 text-sm bg-[#F7F6F4] border border-[#EDECE8] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white transition appearance-none pr-8"
            >
              {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-[#F7F6F4] border border-[#EDECE8] rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingState message="Loading incidents…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : incidents.length === 0 ? (
          <EmptyState title="No incidents found" description="Try adjusting your filters, or upload a log file to detect incidents." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDECE8] bg-[#F0EFE9]">
                {['Severity', 'Incident', 'Source IP', 'Username', 'Risk', 'Status', 'Detected'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDECE8]">
              {incidents.map((inc) => (
                <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="hover:bg-[#EDECE8]/60 cursor-pointer transition-colors group">
                  <td className="px-5 py-4"><SeverityBadge severity={inc.severity as Severity} /></td>
                  <td className="px-5 py-4 font-semibold text-[#111827] max-w-xs"><span className="line-clamp-1">{inc.title}</span></td>
                  <td className="px-5 py-4 font-mono text-xs text-[#6B7280]">{inc.source_ip ?? '—'}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{inc.username ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#111827] tabular-nums">{inc.risk_score}</span>
                    <span className="text-[#D1D5DB]">/100</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={inc.status as IncidentStatus} /></td>
                  <td className="px-5 py-4 text-xs text-[#D1D5DB] whitespace-nowrap">{formatDate(inc.created_at)}</td>
                  <td className="px-4 py-4 text-[#D1D5DB] group-hover:text-[#7C3AED] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && incidents.length > 0 && (
        <p className="text-xs text-[#9CA3AF] mt-3 pl-1">{incidents.length} incident{incidents.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
