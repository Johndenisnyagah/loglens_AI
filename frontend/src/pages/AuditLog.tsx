import { useEffect, useState } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { getAuditLog } from '../api/audit';
import type { AuditEntry } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHead } from '../components/ui/PageHead';
import { PillFilter } from '../components/ui/PillFilter';
import { UserChip } from '../components/ui/UserChip';

const STYLES = `
.audit-page { display: flex; flex-direction: column; min-height: 100%; }
.audit-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 32px 48px 24px; border-bottom: 1px solid var(--color-line-soft); }
.audit-bd { padding: 28px 48px 40px; display: flex; flex-direction: column; gap: 26px; }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--color-line-soft); }
.stat { padding: 22px 24px; border-right: 1px solid var(--color-line-soft); border-bottom: 1px solid var(--color-line-soft); }
.stat:last-child { border-right: 0; }
.stat .lbl { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; margin-bottom: 12px; }
.stat .row { display: flex; align-items: baseline; gap: 12px; }
.stat .val { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; color: var(--color-text); font-variant-numeric: tabular-nums; line-height: 1; }
.stat .delta { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-mono); }
.stat .foot { font-size: 11px; color: var(--color-text-dim); margin-top: 10px; }

.search-row { display: flex; gap: 10px; align-items: center; }
.search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--color-panel); padding: 10px 14px; border: 1px solid var(--color-line); }
.search-box input { flex: 1; background: transparent; border: 0; color: var(--color-text); font-size: 13px; font-family: var(--font-mono); outline: none; }
.search-box input::placeholder { color: var(--color-text-faint); }

.btn { background: transparent; border: 1px solid var(--color-line); padding: 9px 14px; color: var(--color-text); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; gap: 8px; align-items: center; }
.btn:hover { background: var(--color-card); }
.btn.icon { padding: 9px 12px; }

.event-grid { background: var(--color-panel); }
.event-row { display: grid; grid-template-columns: 110px 220px 1fr auto; gap: 24px; padding: 16px 24px; border-bottom: 1px solid var(--color-line-soft); align-items: center; cursor: pointer; }
.event-row:last-child { border-bottom: 0; }
.event-row:hover { background: rgba(255,255,255,0.02); }

.cell-time { font-family: var(--font-mono); font-size: 12px; color: var(--color-text); }
.cell-time .rel { display: block; font-size: 10px; color: var(--color-text-dim); margin-top: 2px; }

.cell-actor { display: flex; align-items: center; gap: 10px; min-width: 0; }
.cell-actor .av { width: 26px; height: 26px; background: linear-gradient(135deg,#6e7484,#3a4150); color: white; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 9px; font-weight: 700; flex-shrink: 0; }
.cell-actor .av.system { background: transparent; border: 1px solid var(--color-line); color: var(--color-text-mid); }
.cell-actor .name { font-size: 13px; color: var(--color-text); font-weight: 500; }
.cell-actor .name.system { color: var(--color-text-mid); }

.event-code { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 12px; color: var(--color-text); min-width: 0; }
.event-code .verb { color: var(--color-text-dim); }
.event-code .dot { width: 6px; height: 6px; flex-shrink: 0; }

.cell-target { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-mid); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cell-target code { color: var(--color-text); }
.cell-target .muted { color: var(--color-text-dim); }

.action-color-auth   { background: var(--color-accent); }
.action-color-status { background: var(--color-warn); }
.action-color-upload { background: var(--color-success); }
.action-color-create { background: var(--color-info); }
.action-color-ai     { background: var(--color-accent); }
.action-color-system { background: var(--color-text-faint); }
`;

function actionGroup(action: string): { color: string; label: string } {
  if (action.startsWith('incident_status'))     return { color: 'action-color-status', label: 'incident.status' };
  if (action.startsWith('incident_'))           return { color: 'action-color-create', label: action.replace('_', '.') };
  if (action.startsWith('ai_'))                 return { color: 'action-color-ai',     label: action.replace('_', '.') };
  if (action.startsWith('file_uploaded'))       return { color: 'action-color-upload', label: 'file.uploaded' };
  if (action.startsWith('file_'))               return { color: 'action-color-system', label: action.replace('_', '.') };
  if (action.startsWith('auth'))                return { color: 'action-color-auth',   label: action.replace('_', '.') };
  return { color: 'action-color-system', label: action };
}

function isSystem(action: string) {
  return action.startsWith('file_') || action.startsWith('ai_');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60)        return `${s}s ago`;
  if (s < 3600)      return `${Math.floor(s / 60)} min ago`;
  if (s < 86400)     return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true); setError('');
    getAuditLog({ limit: 200 })
      .then(setEntries)
      .catch(() => setError('Could not load audit log. Confirm GET /api/audit is exposed on the backend.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.action.toLowerCase().includes(q) ||
           (e.details ?? '').toLowerCase().includes(q) ||
           (e.target_type ?? '').toLowerCase().includes(q);
  });

  const total = entries.length;
  const byUser = entries.filter((e) => !isSystem(e.action)).length;
  const bySystem = total - byUser;
  const failures = entries.filter((e) => /fail|error/i.test(e.action) || /fail|error/i.test(e.details ?? '')).length;

  return (
    <div className="audit-page">
      <style>{STYLES}</style>

      <div className="audit-hd">
        <PageHead
          eyebrow="Audit log · append-only"
          title="Audit log"
          subtitle="A chronological record of every action LogLens performed or a user took. Useful for compliance reviews and post-incident reconstruction."
          right={<><PillFilter>All actions</PillFilter><PillFilter>Last 24 hours</PillFilter><UserChip /></>}
        />
      </div>

      <div className="audit-bd">
      {/* STATS */}
      <div className="stats">
        <div className="stat">
          <div className="lbl">Events · all time</div>
          <div className="row"><span className="val">{total.toLocaleString()}</span></div>
          <div className="foot">across {entries.length > 0 ? new Set(entries.map(e => e.action)).size : 0} action types</div>
        </div>
        <div className="stat">
          <div className="lbl">By the system</div>
          <div className="row"><span className="val">{bySystem.toLocaleString()}</span><span className="delta">{total ? Math.round(bySystem / total * 100) : 0}%</span></div>
          <div className="foot">Detection, analysis, AI summaries</div>
        </div>
        <div className="stat">
          <div className="lbl">By operators</div>
          <div className="row"><span className="val">{byUser.toLocaleString()}</span><span className="delta">{total ? Math.round(byUser / total * 100) : 0}%</span></div>
          <div className="foot">Uploads, status changes, approvals</div>
        </div>
        <div className="stat">
          <div className="lbl">Failures</div>
          <div className="row"><span className="val">{failures.toLocaleString()}</span></div>
          <div className="foot">{failures === 0 ? 'No failures recorded' : 'Investigate via filter'}</div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-row">
        <div className="search-box">
          <Search size={14} strokeWidth={2} style={{ color: 'var(--color-text-dim)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target, or details…"
          />
        </div>
        <button className="btn"><Filter size={12} strokeWidth={2} /> Filter</button>
        <button className="btn"><Download size={12} strokeWidth={2} /> Export CSV</button>
        <button className="btn icon" onClick={load} title="Refresh"><RefreshCw size={12} strokeWidth={2} /></button>
      </div>

      {/* TABLE */}
      <div className="event-grid">
        {loading ? <LoadingState message="Loading audit events…" />
        : error ? <ErrorState message={error} onRetry={load} />
        : filtered.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 13 }}>
            {search ? 'No events match your search.' : 'No audit events yet.'}
          </div>
        ) : filtered.map((e) => {
          const sys = isSystem(e.action);
          const g = actionGroup(e.action);
          return (
            <div key={e.id} className="event-row">
              <div className="cell-time">{formatTime(e.created_at)}<span className="rel">{relTime(e.created_at)}</span></div>
              <div className="cell-actor">
                <div className={`av ${sys ? 'system' : ''}`}>{sys ? 'SYS' : 'SC'}</div>
                <div className={`name ${sys ? 'system' : ''}`}>{sys ? 'LogLens AI' : 'Sarah Chen'}</div>
              </div>
              <div className="event-code">
                <span className={`dot ${g.color}`} />
                <span>{g.label}</span>
                {e.details && <span className="cell-target" style={{ marginLeft: 14 }}><span className="muted">— {e.details}</span></span>}
              </div>
              <div className="cell-target">{e.target_type && e.target_id ? <><code>{e.target_type}</code><span className="muted"> · #{e.target_id}</span></> : null}</div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
