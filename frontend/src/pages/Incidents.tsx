import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, RotateCcw, ExternalLink } from 'lucide-react';
import { getIncidents, getIncident, updateIncidentStatus } from '../api/incidents';
import type { Incident, IncidentDetail, IncidentStatus } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHead } from '../components/ui/PageHead';
import { PillFilter } from '../components/ui/PillFilter';
import { UserChip } from '../components/ui/UserChip';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { TrustBanner } from '../components/ui/TrustBanner';

const STYLES = `
.ai-page { display: flex; flex-direction: column; min-height: 100%; }
.ai-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 32px 48px 24px; border-bottom: 1px solid var(--color-line-soft); }
.ai-bd { padding: 28px 48px 40px; display: flex; flex-direction: column; gap: 28px; }

.split { display: grid; grid-template-columns: 1.05fr 1.5fr; gap: 0; border-top: 1px solid var(--color-line-soft); }

.col-list { padding: 24px 0; display: flex; flex-direction: column; min-width: 0; border-right: 1px solid var(--color-line-soft); }
.list-toolbar { padding: 0 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.list-toolbar h3 { font-size: 13px; font-weight: 600; margin: 0; color: var(--color-text); }
.list-toolbar .chips { display: flex; gap: 6px; }
.chip { background: transparent; border: 1px solid var(--color-line-soft); color: var(--color-text-dim); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px; cursor: pointer; font-weight: 600; font-family: inherit; }
.chip.active { color: var(--color-text); border-color: var(--color-line); background: var(--color-card); }

.ai-card { padding: 18px 24px; margin-right: 24px; cursor: pointer; transition: background 0.12s; border-top: 1px solid var(--color-line-soft); }
.ai-card:first-of-type { border-top: 0; }
.ai-card:hover { background: rgba(255,255,255,0.025); }
.ai-card.selected { background: var(--color-panel); margin-right: 0; border-top-color: transparent; }
.ai-card.selected + .ai-card { border-top-color: transparent; }
.ai-card .meta-line { display: flex; justify-content: space-between; align-items: center; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 500; color: var(--color-text-dim); margin-bottom: 10px; }
.ai-card .meta-line .id { font-family: var(--font-mono); letter-spacing: 0.08em; }
.ai-card .meta-line .when { color: var(--color-text-faint); }
.ai-card .title { font-size: 15px; font-weight: 500; color: var(--color-text); margin-bottom: 12px; max-width: 480px; line-height: 1.35; letter-spacing: -0.005em; }
.ai-card .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mono-mini { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-mid); }
.needs-review { font-size: 9px; letter-spacing: 0.14em; font-weight: 600; text-transform: uppercase; padding: 4px 7px; color: var(--color-warn); background: rgba(249,229,71,0.06); border: 1px solid rgba(249,229,71,0.3); }
.ai-card .conf { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.ai-card .conf .lbl { font-size: 10px; letter-spacing: 0.14em; color: var(--color-text-dim); text-transform: uppercase; font-weight: 500; }
.ai-card .conf .bar { width: 50px; height: 3px; background: rgba(255,255,255,0.06); }
.ai-card .conf .bar > span { display: block; height: 100%; }
.ai-card .conf .num { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-mid); min-width: 28px; }

.col-detail { background: var(--color-panel); padding: 32px 36px; display: flex; flex-direction: column; min-width: 0; }
.detail-eyebrow { display: flex; gap: 14px; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; margin-bottom: 14px; }
.detail-eyebrow .model { color: var(--color-warn); }
.col-detail h2 { font-size: 26px; font-weight: 600; margin: 0 0 18px; line-height: 1.2; letter-spacing: -0.02em; color: var(--color-text); max-width: 520px; }

.tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 26px; align-items: center; }

.detail-body { font-size: 13px; line-height: 1.7; color: var(--color-text-mid); }
.detail-body p { margin: 0 0 14px; }
.detail-body strong { color: var(--color-text); font-weight: 600; }
.detail-body code { font-family: var(--font-mono); color: var(--color-text); }

.section-title { display: flex; align-items: center; gap: 10px; margin: 28px 0 14px; }
.section-title h4 { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 600; margin: 0; }
.section-title .line { flex: 1; height: 1px; background: var(--color-line-soft); }

.actions-list { display: flex; flex-direction: column; gap: 0; }
.action-item { display: grid; grid-template-columns: 18px 1fr auto; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--color-line-soft); cursor: pointer; }
.action-item:last-child { border-bottom: 0; }
.action-item .bullet { width: 14px; height: 14px; border: 1px solid var(--color-text-faint); display: flex; align-items: center; justify-content: center; }
.action-item .text { font-size: 13px; color: var(--color-text); line-height: 1.4; }
.action-item .sub { font-size: 11px; color: var(--color-text-dim); margin-top: 3px; }
.action-item .badge { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; padding: 4px 8px; }
.badge.auto { color: var(--color-accent); border: 1px solid rgba(75,108,246,0.4); background: rgba(75,108,246,0.05); }
.badge.manual { color: var(--color-warn); border: 1px solid rgba(249,229,71,0.3); background: rgba(249,229,71,0.04); }

.detail-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--color-line-soft); }
.footer-meta { display: flex; gap: 22px; font-size: 11px; color: var(--color-text-dim); }
.btn { background: transparent; border: 1px solid var(--color-line); padding: 8px 14px; color: var(--color-text); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; gap: 8px; align-items: center; }
.btn:hover { background: var(--color-card); }
.btn.ghost { color: var(--color-text-mid); border-color: var(--color-line-soft); }
.btn.primary { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.btn.primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.evidence-block { background: var(--color-bg-app); border: 1px solid var(--color-line-soft); padding: 12px 14px; font-family: var(--font-mono); font-size: 11px; line-height: 1.65; color: var(--color-text-mid); max-height: 220px; overflow-y: auto; white-space: pre-wrap; }

.confidence-meta { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 14px 0; margin-top: 4px; }
.confidence-meta .lbl { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; }
.confidence-meta .bar { height: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
.confidence-meta .bar > span { display: block; height: 100%; }
.confidence-meta .num { font-family: var(--font-mono); color: var(--color-text); font-size: 13px; min-width: 32px; text-align: right; }
`;

type FilterChip = 'all' | 'needs_review' | 'approved';

const sevColor = (s: string) =>
  s === 'critical' ? 'var(--color-danger)'
: s === 'high'     ? 'var(--color-info)'
: s === 'medium'   ? 'var(--color-warn)'
                   : 'var(--color-success)';

const confPct = (c: string | undefined) => c === 'high' ? 92 : c === 'medium' ? 72 : c === 'low' ? 48 : 80;
const confColor = (c: string | undefined) => c === 'low' ? 'var(--color-warn)' : 'var(--color-success)';

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(1, m)} MIN AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} H AGO`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

const RULE_LABELS: Record<string, string> = {
  brute_force_failed_logins:       'Brute-force failed logins',
  sensitive_username_targeted:     'Sensitive username targeted',
  successful_login_after_failures: 'Successful login after failures',
  username_enumeration:            'Username enumeration',
};

export function Incidents() {
  const navigate = useNavigate();
  const [list, setList] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<FilterChip>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadList = () => {
    setLoadingList(true); setError('');
    getIncidents()
      .then((items) => {
        setList(items);
        if (items.length > 0) setSelectedId(items[0].id);
      })
      .catch(() => setError('Could not load incidents.'))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (selectedId === null) return;
    setLoadingDetail(true);
    getIncident(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  async function setStatus(status: IncidentStatus) {
    if (!detail) return;
    setUpdating(true);
    try {
      await updateIncidentStatus(detail.id, status);
      setDetail({ ...detail, status });
      setList((cur) => cur.map((i) => i.id === detail.id ? { ...i, status } : i));
    } catch {/* ignore */} finally { setUpdating(false); }
  }

  const filtered = list.filter((i) => {
    if (filter === 'needs_review') return i.needs_human_review && i.status === 'open';
    if (filter === 'approved')     return i.status === 'reviewed' || i.status === 'resolved';
    return true;
  });

  return (
    <div className="ai-page">
      <style>{STYLES}</style>

      <div className="ai-hd">
        <PageHead
          eyebrow={`AI summaries · ${list.length} incidents · model GPT-4o-mini`}
          title="AI summaries"
          subtitle="Plain-language explanations and remediation guidance for incidents flagged by LogLens detection rules."
          right={<><PillFilter>All severities</PillFilter><PillFilter>Last 24 hours</PillFilter><UserChip /></>}
        />
      </div>

      <div className="ai-bd">
      <TrustBanner />

      <div className="split">
        {/* LIST */}
        <div className="col-list">
          <div className="list-toolbar">
            <h3>Recent summaries</h3>
            <div className="chips">
              <button className={`chip ${filter === 'all' ? 'active' : ''}`}        onClick={() => setFilter('all')}>All</button>
              <button className={`chip ${filter === 'needs_review' ? 'active' : ''}`} onClick={() => setFilter('needs_review')}>Needs review</button>
              <button className={`chip ${filter === 'approved' ? 'active' : ''}`}     onClick={() => setFilter('approved')}>Approved</button>
            </div>
          </div>

          {loadingList ? <LoadingState message="Loading summaries…" />
          : error ? <ErrorState message={error} onRetry={loadList} />
          : filtered.length === 0 ? <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 13 }}>No incidents match this filter.</div>
          : (
            <div className="list">
              {filtered.map((inc) => {
                const selected = inc.id === selectedId;
                return (
                  <div key={inc.id} className={`ai-card ${selected ? 'selected' : ''}`} onClick={() => setSelectedId(inc.id)}>
                    <div className="meta-line"><span className="id">AI-{String(inc.id).padStart(3, '0')}</span><span className="when">{relTime(inc.created_at)}</span></div>
                    <div className="title">{inc.title}</div>
                    <div className="row">
                      <SeverityBadge severity={inc.severity} />
                      {inc.source_ip && <span className="mono-mini">{inc.source_ip}</span>}
                      {inc.source_ip && inc.username && <span className="mono-mini" style={{ color: 'var(--color-text-faint)' }}>·</span>}
                      {inc.username && <span className="mono-mini">{inc.username}</span>}
                      {inc.needs_human_review && <span className="needs-review">Needs review</span>}
                      <div className="conf">
                        <span className="lbl">Conf</span>
                        <div className="bar"><span style={{ width: `${inc.risk_score}%`, background: sevColor(inc.severity) }} /></div>
                        <span className="num">{inc.risk_score}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="col-detail">
          {loadingDetail || !detail ? (
            loadingDetail ? <LoadingState message="Loading summary…" />
                          : <div style={{ color: 'var(--color-text-dim)', fontSize: 13, padding: '60px 0' }}>Select an incident to see its AI summary.</div>
          ) : (
            <>
              <div className="detail-eyebrow">
                <span>AI-{String(detail.id).padStart(3, '0')}</span>
                <span>·</span>
                <span className="model">{detail.ai_summary?.model_used ?? 'pending'}</span>
                <span>·</span>
                <span>{relTime(detail.created_at)}</span>
              </div>
              <h2>{detail.title}</h2>
              <div className="tags-row">
                <SeverityBadge severity={detail.severity} />
                {detail.source_ip && <span className="mono-mini">{detail.source_ip}</span>}
                {detail.username && <><span className="mono-mini" style={{ color: 'var(--color-text-faint)' }}>·</span><span className="mono-mini">{detail.username}</span></>}
                <span className="mono-mini" style={{ color: 'var(--color-text-faint)' }}>·</span>
                <span className="mono-mini">{RULE_LABELS[detail.detection_rule] ?? detail.detection_rule}</span>
              </div>

              {detail.ai_summary ? (
                <div className="detail-body">
                  <p>{detail.ai_summary.summary}</p>

                  <div className="section-title"><h4>Why it matters</h4><div className="line" /></div>
                  <p>{detail.ai_summary.why_it_matters}</p>

                  <div className="section-title"><h4>Recommended actions · awaiting your approval</h4><div className="line" /></div>
                  <div className="actions-list">
                    {detail.ai_summary.recommended_actions.map((a, i) => (
                      <div key={i} className="action-item">
                        <div className="bullet"><Check size={10} strokeWidth={3} style={{ color: 'var(--color-text-faint)' }} /></div>
                        <div>
                          <div className="text">{a}</div>
                        </div>
                        <span className="badge manual">Manual</span>
                      </div>
                    ))}
                  </div>

                  <div className="section-title"><h4>Confidence</h4><div className="line" /></div>
                  <div className="confidence-meta">
                    <span className="lbl">{detail.ai_summary.confidence}</span>
                    <div className="bar"><span style={{ width: `${confPct(detail.ai_summary.confidence)}%`, background: confColor(detail.ai_summary.confidence) }} /></div>
                    <span className="num">{confPct(detail.ai_summary.confidence)}%</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-dim)', fontSize: 13 }}>AI summary not yet generated for this incident.</p>
              )}

              {detail.evidence.length > 0 && (
                <>
                  <div className="section-title"><h4>Evidence ({detail.evidence.length} lines)</h4><div className="line" /></div>
                  <div className="evidence-block">
                    {detail.evidence.slice(0, 12).map((e) => e.raw_message).join('\n')}
                  </div>
                </>
              )}

              <div className="detail-footer">
                <div className="footer-meta">
                  <span>Status: <strong style={{ color: 'var(--color-text)' }}>{detail.status}</strong></span>
                  <span>Risk: <strong style={{ color: 'var(--color-text)' }}>{detail.risk_score}/100</strong></span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn ghost"   disabled={updating || detail.status === 'false_positive'} onClick={() => setStatus('false_positive')}><X size={12} strokeWidth={2.5} /> False positive</button>
                  <button className="btn ghost"   disabled={updating || detail.status === 'reviewed'}       onClick={() => setStatus('reviewed')}><RotateCcw size={12} strokeWidth={2.5} /> Reviewed</button>
                  <button className="btn primary" disabled={updating || detail.status === 'resolved'}       onClick={() => setStatus('resolved')}><Check size={12} strokeWidth={3} /> Resolve</button>
                  <button className="btn" onClick={() => navigate(`/incidents/${detail.id}`)}>Open <ExternalLink size={12} strokeWidth={2} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
