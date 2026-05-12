import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Sparkles, CheckCircle2, XCircle, Eye, Clock, ShieldAlert, User, Globe } from 'lucide-react';
import { getIncident, updateIncidentStatus } from '../api/incidents';
import type { IncidentDetail as IIncidentDetail, IncidentStatus } from '../types';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RawLogBlock } from '../components/ui/RawLogBlock';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

const RULE_LABELS: Record<string, string> = {
  brute_force_failed_logins: 'Brute-force Failed Logins',
  sensitive_username_targeted: 'Sensitive Username Targeted',
  successful_login_after_failures: 'Successful Login After Failures',
  username_enumeration: 'Username Enumeration',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 86 ? '#000000' : score >= 61 ? '#6AA6DA' : score >= 31 ? '#DBE3E9' : '#E1E5AC';
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EEF2F5" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#000000]">{score}</span>
      </div>
      <div>
        <p className="text-xs text-[#7A92A8]">Risk Score</p>
        <p className="text-sm font-bold text-[#000000]">{score} / 100</p>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, mono = false }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-[#7A92A8] mb-0.5"><Icon className="w-3 h-3" />{label}</p>
      <p className={`text-sm text-[#000000] ${mono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
    </div>
  );
}

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IIncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getIncident(Number(id)).then(setIncident).catch(() => setError('Could not load incident.')).finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status: IncidentStatus) {
    if (!incident) return;
    setUpdating(true);
    try {
      const updated = await updateIncidentStatus(incident.id, status);
      setIncident((prev) => prev ? { ...prev, status: updated.status } : prev);
    } finally { setUpdating(false); }
  }

  if (loading)            return <LoadingState message="Loading incident…" />;
  if (error || !incident) return <ErrorState message={error || 'Incident not found.'} onRetry={() => navigate('/incidents')} />;

  const ai = incident.ai_summary;

  return (
    <div>
      <button onClick={() => navigate('/incidents')}
        className="flex items-center gap-1.5 text-sm text-[#7A92A8] hover:text-[#000000] mb-6 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} /> All incidents
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-[#F5F7FA] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[#000000] leading-snug">{incident.title}</h1>
                <p className="text-sm text-[#3D5166] mt-1.5 leading-relaxed">{incident.description}</p>
              </div>
              <SeverityBadge severity={incident.severity} className="shrink-0" />
            </div>
            <div className="flex flex-wrap gap-8 items-start">
              <RiskGauge score={incident.risk_score} />
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1 min-w-[180px]">
                <MetaItem icon={Globe} label="Source IP" value={incident.source_ip ?? '—'} mono />
                <MetaItem icon={User} label="Username" value={incident.username ?? '—'} mono />
                <MetaItem icon={ShieldAlert} label="Detection Rule" value={RULE_LABELS[incident.detection_rule] ?? incident.detection_rule} />
                <MetaItem icon={Clock} label="Detected" value={formatDate(incident.created_at)} />
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#EEF2F5] flex flex-wrap items-center gap-2.5">
              <StatusBadge status={incident.status} />
              {incident.needs_human_review && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#3D5166] bg-[#E1E5AC] px-2.5 py-1 rounded-lg font-medium">
                  <AlertTriangle className="w-3 h-3" strokeWidth={2} /> Needs human review
                </span>
              )}
            </div>
          </div>

          {/* Evidence */}
          {incident.evidence.length > 0 && (
            <div className="bg-[#F5F7FA] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-[#000000] mb-4">Evidence Log Lines</h2>
              <RawLogBlock lines={incident.evidence.map((e) => e.raw_message)} />
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="bg-[#F5F7FA] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-[#6AA6DA] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#FBFBF8]" strokeWidth={2} />
              </div>
              <h2 className="text-sm font-bold text-[#000000]">AI Summary</h2>
            </div>
            {ai ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#7A92A8] uppercase tracking-widest mb-1.5">Summary</p>
                  <p className="text-xs text-[#3D5166] leading-relaxed">{ai.summary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7A92A8] uppercase tracking-widest mb-1.5">Why it matters</p>
                  <p className="text-xs text-[#3D5166] leading-relaxed">{ai.why_it_matters}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7A92A8] uppercase tracking-widest mb-2">Actions</p>
                  <ul className="space-y-1.5">
                    {ai.recommended_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#3D5166]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6AA6DA] shrink-0 mt-0.5" strokeWidth={2.5} />{a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-[#EEF2F5] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#7A92A8] uppercase tracking-widest">Confidence</p>
                    <p className="text-xs font-bold capitalize mt-0.5 text-[#000000]">{ai.confidence}</p>
                  </div>
                  {ai.model_used && <span className="text-[10px] text-[#7A92A8] bg-white px-2 py-1 rounded-lg border border-[#EEF2F5]">{ai.model_used}</span>}
                </div>
              </div>
            ) : <p className="text-xs text-[#7A92A8]">AI summary not available.</p>}
          </div>

          {/* Status actions */}
          <div className="bg-[#F5F7FA] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#000000] mb-3">Update Status</h2>
            <div className="space-y-2">
              <button onClick={() => setStatus('reviewed')} disabled={updating || incident.status === 'reviewed'}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl bg-white border border-[#EEF2F5] text-[#000000] hover:border-[#6AA6DA] hover:text-[#6AA6DA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Eye className="w-4 h-4" strokeWidth={1.8} /> Mark Reviewed
              </button>
              <button onClick={() => setStatus('false_positive')} disabled={updating || incident.status === 'false_positive'}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl bg-white border border-[#EEF2F5] text-[#000000] hover:bg-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <XCircle className="w-4 h-4 text-[#7A92A8]" strokeWidth={1.8} /> Mark False Positive
              </button>
              <button onClick={() => setStatus('resolved')} disabled={updating || incident.status === 'resolved'}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-xl bg-[#000000] text-[#FBFBF8] hover:bg-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
