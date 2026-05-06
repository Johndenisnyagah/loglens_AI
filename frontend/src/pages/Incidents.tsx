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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus]   = useState('');
  const [search, setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getIncidents({
      severity: severity || undefined,
      status:   status   || undefined,
      search:   search   || undefined,
    })
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C4C2BD]" />
          <input
            type="text"
            placeholder="Search IP or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#1C1C1E] placeholder:text-[#C4C2BD] focus:outline-none focus:ring-2 focus:ring-[#5B7FD4]/20 w-52 transition"
          />
        </div>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="px-3 py-2 text-sm bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#5B7FD4]/20 transition appearance-none pr-8"
        >
          {SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#5B7FD4]/20 transition appearance-none pr-8"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] overflow-hidden">
        {loading ? (
          <LoadingState message="Loading incidents…" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No incidents found"
            description="Try adjusting your filters, or upload a log file to detect incidents."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F2F1EE] bg-[#F7F6F3]">
                {['Severity', 'Incident', 'Source IP', 'Username', 'Risk Score', 'Status', 'Detected'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] font-semibold text-[#9A9994] uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F1EE]">
              {incidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="hover:bg-[#F9F8F6] cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-4">
                    <SeverityBadge severity={inc.severity as Severity} />
                  </td>
                  <td className="px-5 py-4 font-medium text-[#1C1C1E] max-w-xs">
                    <span className="line-clamp-1">{inc.title}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[#6B6B6B] text-xs">
                    {inc.source_ip ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-[#6B6B6B]">
                    {inc.username ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-[#1C1C1E] tabular-nums">{inc.risk_score}</span>
                    <span className="text-[#C4C2BD]">/100</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={inc.status as IncidentStatus} />
                  </td>
                  <td className="px-5 py-4 text-[#C4C2BD] text-xs whitespace-nowrap">
                    {formatDate(inc.created_at)}
                  </td>
                  <td className="px-4 py-4 text-[#C4C2BD] group-hover:text-[#9A9994] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && incidents.length > 0 && (
        <p className="text-xs text-[#C4C2BD] mt-3 pl-1">
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
