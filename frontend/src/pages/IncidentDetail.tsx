import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { getIncident, updateIncidentStatus } from '../api/incidents';
import type { IncidentDetail as IIncidentDetail, IncidentStatus } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHead } from '../components/ui/PageHead';
import { UserChip } from '../components/ui/UserChip';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TrustBanner } from '../components/ui/TrustBanner';

const STYLES = `
.idd-page { display: flex; flex-direction: column; min-height: 100%; }
.idd-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 24px 48px 20px; border-bottom: 1px solid var(--color-line-soft); display: flex; flex-direction: column; gap: 14px; }
.idd-bd { padding: 28px 48px 40px; display: flex; flex-direction: column; gap: 22px; }
.idd-back { display: inline-flex; align-items: center; gap: 8px; color: var(--color-text-dim); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; cursor: pointer; background: none; border: 0; padding: 0; font-family: inherit; width: fit-content; }
.idd-back:hover { color: var(--color-text); }

.idd-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 28px; align-items: start; }

.idd-panel { background: var(--color-panel); padding: 28px 32px; }
.idd-panel h2 { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; color: var(--color-text); margin: 6px 0 14px; max-width: 520px; }
.idd-body  { font-size: 13px; line-height: 1.7; color: var(--color-text-mid); margin: 0; }
.idd-body code { font-family: var(--font-mono); color: var(--color-text); }

.tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 22px; align-items: center; }
.mono-mini { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-mid); }

.kv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px 24px; margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--color-line-soft); }
.kv-cell .lbl { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; margin-bottom: 6px; }
.kv-cell .val { font-size: 13px; color: var(--color-text); font-weight: 500; }
.kv-cell .val.mono { font-family: var(--font-mono); font-weight: 400; }

.risk-gauge { display: flex; align-items: center; gap: 14px; }
.risk-gauge svg { width: 56px; height: 56px; }
.risk-gauge .info { font-size: 11px; color: var(--color-text-dim); }
.risk-gauge .info strong { display: block; font-size: 14px; font-weight: 600; color: var(--color-text); margin-top: 2px; }

.section-title { display: flex; align-items: center; gap: 10px; margin: 28px 0 14px; }
.section-title h4 { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 600; margin: 0; }
.section-title .line { flex: 1; height: 1px; background: var(--color-line-soft); }

.evidence-block { background: var(--color-bg-app); border: 1px solid var(--color-line-soft); padding: 14px 16px; font-family: var(--font-mono); font-size: 11px; line-height: 1.65; color: var(--color-text-mid); max-height: 320px; overflow-y: auto; white-space: pre-wrap; }

.side-stack { display: flex; flex-direction: column; gap: 22px; }
.ai-card-side { background: var(--color-panel); padding: 24px 26px; }
.ai-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.ai-glyph { width: 28px; height: 28px; background: var(--color-accent); color: white; display: flex; align-items: center; justify-content: center; }
.ai-card-side h3 { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: var(--color-text); margin: 0; }
.ai-subhead { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; margin: 14px 0 6px; }
.ai-prose { font-size: 12px; line-height: 1.65; color: var(--color-text-mid); margin: 0; }

.actions-list { display: flex; flex-direction: column; gap: 0; margin-top: 6px; }
.act-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-line-soft); font-size: 12px; color: var(--color-text-mid); line-height: 1.55; }
.act-item:last-child { border-bottom: 0; }
.act-item svg { color: var(--color-accent); margin-top: 2px; flex-shrink: 0; }

.action-bar { background: var(--color-panel); padding: 18px 22px; display: flex; flex-direction: column; gap: 10px; }
.btn { background: transparent; border: 1px solid var(--color-line); padding: 9px 14px; color: var(--color-text); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; gap: 8px; align-items: center; justify-content: center; }
.btn:hover { background: var(--color-card); }
.btn.primary { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.btn.primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const RULE_LABELS: Record<string, string> = {
  brute_force_failed_logins:       'Brute-force failed logins',
  sensitive_username_targeted:     'Sensitive username targeted',
  successful_login_after_failures: 'Successful login after failures',
  username_enumeration:            'Username enumeration',
};

const sevToCss = (s: string) =>
  s === 'critical' ? 'var(--color-danger)'
: s === 'high'     ? 'var(--color-info)'
: s === 'medium'   ? 'var(--color-warn)'
                   : 'var(--color-success)';

function RiskGauge({ score, severity }: { score: number; severity: string }) {
  const color = sevToCss(severity);
  return (
    <div className="risk-gauge">
      <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" />
      </svg>
      <div className="info">Risk score<strong>{score}/100</strong></div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
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
    setLoading(true); setError('');
    getIncident(Number(id))
      .then(setIncident)
      .catch(() => setError('Could not load incident.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status: IncidentStatus) {
    if (!incident) return;
    setUpdating(true);
    try {
      const updated = await updateIncidentStatus(incident.id, status);
      setIncident({ ...incident, status: updated.status });
    } finally { setUpdating(false); }
  }

  if (loading) return <div className="idd-page"><style>{STYLES}</style><LoadingState message="Loading incident…" /></div>;
  if (error || !incident) return <div className="idd-page"><style>{STYLES}</style><ErrorState message={error || 'Incident not found.'} onRetry={() => navigate('/incidents')} /></div>;

  const ai = incident.ai_summary;

  return (
    <div className="idd-page">
      <style>{STYLES}</style>

      <div className="idd-hd">
        <button className="idd-back" onClick={() => navigate('/incidents')}>
          <ArrowLeft size={14} strokeWidth={2.2} /> Back to incidents
        </button>
        <PageHead
          eyebrow={`Incident · INC-${String(incident.id).padStart(3, '0')}`}
          title="Incident workspace"
          subtitle="Review evidence, AI guidance, and approve a response action."
          right={<UserChip />}
        />
      </div>

      <div className="idd-bd">
      <TrustBanner />

      <div className="idd-grid">
        {/* MAIN */}
        <div className="idd-panel">
          <RiskGauge score={incident.risk_score} severity={incident.severity} />
          <h2>{incident.title}</h2>
          <div className="tags-row">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            {incident.needs_human_review && (
              <span className="mono-mini" style={{ color: 'var(--color-warn)' }}>· needs human review</span>
            )}
          </div>
          <p className="idd-body">{incident.description}</p>

          <div className="kv-grid">
            <div className="kv-cell"><div className="lbl">Source IP</div><div className="val mono">{incident.source_ip ?? '—'}</div></div>
            <div className="kv-cell"><div className="lbl">Username</div><div className="val mono">{incident.username ?? '—'}</div></div>
            <div className="kv-cell"><div className="lbl">Detection rule</div><div className="val">{RULE_LABELS[incident.detection_rule] ?? incident.detection_rule}</div></div>
            <div className="kv-cell"><div className="lbl">Detected</div><div className="val">{formatDate(incident.created_at)}</div></div>
          </div>

          {incident.evidence.length > 0 && (
            <>
              <div className="section-title"><h4>Evidence ({incident.evidence.length} lines)</h4><div className="line" /></div>
              <div className="evidence-block">{incident.evidence.map((e) => e.raw_message).join('\n')}</div>
            </>
          )}
        </div>

        {/* SIDE */}
        <div className="side-stack">
          <div className="ai-card-side">
            <div className="ai-head">
              <div className="ai-glyph"><Sparkles size={14} strokeWidth={2} /></div>
              <h3>AI summary</h3>
            </div>
            {ai ? (
              <>
                <div className="ai-subhead">Summary</div>
                <p className="ai-prose">{ai.summary}</p>
                <div className="ai-subhead">Why it matters</div>
                <p className="ai-prose">{ai.why_it_matters}</p>
                <div className="ai-subhead">Recommended actions</div>
                <div className="actions-list">
                  {ai.recommended_actions.map((a, i) => (
                    <div key={i} className="act-item"><Check size={12} strokeWidth={2.5} />{a}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--color-line-soft)', fontSize: 11, color: 'var(--color-text-dim)' }}>
                  <span>Confidence: <strong style={{ color: 'var(--color-text)', textTransform: 'capitalize' }}>{ai.confidence}</strong></span>
                  {ai.model_used && <span style={{ fontFamily: 'var(--font-mono)' }}>{ai.model_used}</span>}
                </div>
              </>
            ) : <p className="ai-prose">AI summary not available for this incident yet.</p>}
          </div>

          <div className="action-bar">
            <button className="btn" disabled={updating || incident.status === 'reviewed'} onClick={() => setStatus('reviewed')}>
              <RotateCcw size={12} strokeWidth={2.5} /> Mark reviewed
            </button>
            <button className="btn" disabled={updating || incident.status === 'false_positive'} onClick={() => setStatus('false_positive')}>
              <X size={12} strokeWidth={2.5} /> False positive
            </button>
            <button className="btn primary" disabled={updating || incident.status === 'resolved'} onClick={() => setStatus('resolved')}>
              <Check size={12} strokeWidth={3} /> Mark resolved
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
