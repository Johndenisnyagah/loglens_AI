import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboard';
import { getLogs } from '../api/logs';
import type { DashboardSummary, LogFile, Severity } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHead } from '../components/ui/PageHead';
import { PillFilter } from '../components/ui/PillFilter';
import { UserChip } from '../components/ui/UserChip';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { ChevronRight } from 'lucide-react';

const TIME_OPTS = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'All time'];
const TIME_HOURS: Record<string, number> = {
  'Last 24 hours': 24,
  'Last 7 days':   168,
  'Last 30 days':  720,
  'All time':      0,
};

const STYLES = `
.dash-content { display: flex; flex-direction: column; min-height: 100%; }
.dash-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 32px 48px 24px; border-bottom: 1px solid var(--color-line-soft); }
.dash-bd { padding: 28px 48px 40px; display: flex; flex-direction: column; gap: 28px; }

.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--color-line-soft); }
.metric  { padding: 26px 28px 22px; border-right: 1px solid var(--color-line-soft); border-bottom: 1px solid var(--color-line-soft); }
.metric:last-child { border-right: 0; }
.metric .label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; margin-bottom: 14px; }
.metric .num-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 14px; }
.metric .num { font-size: 36px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; color: var(--color-text); font-variant-numeric: tabular-nums; }
.metric .delta { font-size: 11px; color: var(--color-text-dim); letter-spacing: 0.04em; font-family: var(--font-mono); }
.metric .delta.up   { color: var(--color-text-mid); }
.metric .delta.down { color: var(--color-text-dim); }
.metric .bar { height: 3px; background: rgba(255,255,255,0.04); overflow: hidden; }
.metric .bar > span { display: block; height: 100%; }

.main-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 28px; }

.panel { background: var(--color-panel); padding: 22px 28px 24px; }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; margin-bottom: 4px; border-bottom: 1px solid var(--color-line-soft); }
.panel-head h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); margin: 0; }
.panel-head .meta { font-size: 11px; color: var(--color-text-dim); }
.panel-head .meta a { color: var(--color-accent); text-decoration: none; }
.panel-head .meta a:hover { color: var(--color-accent-hover); }

.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { text-align: left; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; padding: 16px 12px 12px; border-bottom: 1px solid var(--color-line-soft); }
.tbl td { padding: 14px 12px; border-bottom: 1px solid var(--color-line-soft); color: var(--color-text-mid); }
.tbl tr:last-child td { border-bottom: 0; }
.tbl tr { cursor: pointer; }
.tbl tr:hover td { background: rgba(255,255,255,0.02); color: var(--color-text); }
.mono { font-family: var(--font-mono); color: var(--color-text); }
.mono-dim { font-family: var(--font-mono); color: var(--color-text-dim); font-size: 11px; }
.risk-cell { display: flex; align-items: center; gap: 10px; min-width: 60px; }
.risk-bar { width: 50px; height: 3px; background: rgba(255,255,255,0.06); overflow: hidden; flex-shrink: 0; }
.risk-bar > span { display: block; height: 100%; }
.risk-cell .num { font-family: var(--font-mono); font-size: 12px; color: var(--color-text); min-width: 22px; }
.code { font-family: var(--font-mono); color: var(--color-text-mid); font-size: 12px; }

.ai-tags { display: flex; gap: 6px; margin: 16px 0 18px; }
.ai-tags .tag { font-size: 9px; letter-spacing: 0.14em; font-weight: 600; text-transform: uppercase; padding: 4px 8px; border: 1px solid var(--color-line); color: var(--color-text-mid); }
.ai-tags .tag.crit { color: var(--color-danger); border-color: rgba(239,91,107,0.4); }
.ai-headline { font-size: 17px; font-weight: 600; margin: 0 0 14px; line-height: 1.25; letter-spacing: -0.01em; color: var(--color-text); max-width: 360px; }
.ai-body { font-size: 13px; line-height: 1.65; color: var(--color-text-mid); margin: 0 0 18px; }
.ai-link { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-warn); font-weight: 600; display: inline-flex; gap: 8px; text-decoration: none; align-items: center; }
.ai-meta { display: flex; align-items: center; gap: 8px; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--color-line-soft); font-size: 11px; color: var(--color-text-dim); }
.ai-pulse-wrap {
  width: 16px; height: 16px; flex-shrink: 0;
  border: 1px solid rgba(249,229,71,0.55);
  display: flex; align-items: center; justify-content: center;
  animation: ai-sq-pulse 4s ease-in-out infinite;
}
.ai-pulse-dot { width: 6px; height: 6px; background: var(--color-warn); border-radius: 50%; }
@keyframes ai-sq-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(249,229,71,0.45); border-color: rgba(249,229,71,0.45); }
  50%      { box-shadow: 0 0 0 5px rgba(249,229,71,0);  border-color: rgba(249,229,71,0.95); }
}

.ips { display: flex; flex-direction: column; gap: 0; }
.ip-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--color-line-soft); }
.ip-row:last-child { border-bottom: 0; }
.ip-name { font-family: var(--font-mono); font-size: 13px; color: var(--color-text); }
.ip-events { font-size: 11px; color: var(--color-text-dim); margin-top: 2px; }
.ip-risk { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-mid); min-width: 22px; text-align: right; }
.ip-bar { width: 50px; height: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
.ip-bar > span { display: block; height: 100%; }
`;

const sevColor = (s: Severity) =>
  s === 'critical' ? 'var(--color-danger)'
: s === 'high'     ? 'var(--color-info)'
: s === 'medium'   ? 'var(--color-warn)'
                   : 'var(--color-success)';

const sevName = (s: Severity) => s.charAt(0).toUpperCase() + s.slice(1);

const statusLabel: Record<string, string> = {
  open: 'Open', reviewed: 'Reviewed', false_positive: 'False positive', resolved: 'Resolved',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]       = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false); // soft reload (filters changed)
  const [error, setError]     = useState('');
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [timeRange, setTimeRange] = useState('All time');
  const [hostLabel, setHostLabel] = useState('All hosts');

  const hostOpts = ['All hosts', ...logFiles.map((f) => f.filename)];

  const selectedFileId = hostLabel === 'All hosts'
    ? undefined
    : logFiles.find((f) => f.filename === hostLabel)?.id;

  const load = (soft = false) => {
    soft ? setFetching(true) : setLoading(true);
    setError('');
    getDashboardSummary({ hours: TIME_HOURS[timeRange], log_file_id: selectedFileId })
      .then(setData)
      .catch(() => setError('Could not load dashboard data. Is the backend running?'))
      .finally(() => { setLoading(false); setFetching(false); });
  };

  // Fetch log files once for host dropdown
  useEffect(() => { getLogs().then(setLogFiles).catch(() => {}); }, []);

  // Reload when filters change (soft reload — no full spinner)
  useEffect(() => { load(true); }, [timeRange, hostLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial hard load
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return <div className="dash-content"><style>{STYLES}</style><div className="dash-bd"><LoadingState message="Loading overview…" /></div></div>;
  if (error || !data) return <div className="dash-content"><style>{STYLES}</style><div className="dash-bd"><ErrorState message={error || 'No data.'} onRetry={() => load()} /></div></div>;

  const metrics = [
    { label: 'Logs analyzed',       num: data.total_logs,          delta: '',           bg: 'rgba(181,186,196,0.5)', width: Math.min(100, data.total_logs * 4) },
    { label: 'Incidents detected',  num: data.total_incidents,     delta: '',           bg: 'rgba(181,186,196,0.5)', width: Math.min(100, data.total_incidents * 2) },
    { label: 'High-risk incidents', num: data.high_risk_incidents, delta: '',           bg: 'rgba(239,91,107,0.65)', width: Math.min(100, data.high_risk_incidents * 6) },
    { label: 'Needs human review',  num: data.needs_review_count,  delta: '',           bg: 'rgba(249,229,71,0.55)', width: Math.min(100, data.needs_review_count * 5) },
  ];

  const subtitle = `Showing activity across ${hostLabel === 'All hosts' ? 'all monitored hosts' : hostLabel} · ${timeRange.toLowerCase()}.`;

  return (
    <div className="dash-content">
      <style>{STYLES}</style>

      <div className="dash-hd">
      <PageHead
        eyebrow={`${today} · last analyzed just now`}
        title="Security overview"
        subtitle={subtitle}
        right={
          <>
            <PillFilter
              options={TIME_OPTS}
              value={timeRange}
              onChange={setTimeRange}
            >
              Last 24 hours
            </PillFilter>
            <PillFilter
              options={hostOpts}
              value={hostLabel}
              onChange={setHostLabel}
            >
              All hosts
            </PillFilter>
            <UserChip />
          </>
        }
      />
      </div>

      <div className="dash-bd" style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.2s ease' }}>
      {/* METRICS */}
      <div className="metrics">
        {metrics.map((m) => (
          <div key={m.label} className="metric">
            <div className="label">{m.label}</div>
            <div className="num-row">
              <div className="num">{m.num}</div>
              {m.delta && <div className="delta up">{m.delta}</div>}
            </div>
            <div className="bar"><span style={{ width: `${m.width}%`, background: m.bg }} /></div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">
        {/* Recent incidents */}
        <div className="panel">
          <div className="panel-head">
            <h3>Recent incidents</h3>
            <div className="meta"><a href="#" onClick={(e) => { e.preventDefault(); navigate('/incidents'); }}>View all {data.total_incidents} →</a></div>
          </div>
          {data.recent_incidents.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
              No incidents yet. Upload a log file to get started.
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Source IP</th>
                  <th>Username</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_incidents.slice(0, 9).map((inc) => (
                  <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}>
                    <td><SeverityBadge severity={inc.severity} /></td>
                    <td className="mono">{inc.source_ip ?? '—'}</td>
                    <td><code className="code">{inc.username ?? '—'}</code></td>
                    <td>
                      <div className="risk-cell">
                        <div className="risk-bar"><span style={{ width: `${inc.risk_score}%`, background: sevColor(inc.severity) }} /></div>
                        <div className="num">{inc.risk_score}</div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, padding: '3px 8px', border: '1px solid currentColor', display: 'inline-block', color: inc.status === 'resolved' ? 'var(--color-success)' : inc.status === 'reviewed' ? 'var(--color-warn)' : 'var(--color-text-mid)' }}>{statusLabel[inc.status] ?? inc.status}</span></td>
                    <td className="mono-dim" style={{ textAlign: 'right' }}>{formatTime(inc.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* AI insight */}
          <div className="panel">
            <div className="panel-head">
              <h3>AI security insight</h3>
            </div>
            <div className="ai-tags">
              <span className="tag crit">{data.high_risk_incidents > 0 ? 'CRITICAL' : 'INFO'}</span>
              <span className="tag">{data.top_suspicious_ips.length} IPs</span>
              <span className="tag">{data.total_incidents} incidents</span>
            </div>
            {data.ai_insight ? (
              <>
                <h4 className="ai-headline">Latest AI-generated analysis</h4>
                <p className="ai-body">{data.ai_insight}</p>
              </>
            ) : (
              <>
                <h4 className="ai-headline">No AI insights yet</h4>
                <p className="ai-body">Upload logs to surface deterministic incidents and AI explanations.</p>
              </>
            )}
            <a className="ai-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/incidents'); }}>
              Open full report <ChevronRight size={10} strokeWidth={2.5} />
            </a>
            <div className="ai-meta">
              <div className="ai-pulse-wrap"><div className="ai-pulse-dot" /></div>
              <span>Live · {data.top_suspicious_ips.reduce((s, ip) => s + ip.incident_count, 0)} events analyzed</span>
            </div>
          </div>

          {/* Suspicious IPs */}
          <div className="panel">
            <div className="panel-head">
              <h3>Suspicious IPs</h3>
              <div className="meta">Top {data.top_suspicious_ips.length} by activity</div>
            </div>
            {data.top_suspicious_ips.length === 0 ? (
              <div style={{ padding: '20px 0', fontSize: '13px', color: 'var(--color-text-dim)' }}>No suspicious activity detected.</div>
            ) : (
              <div className="ips">
                {data.top_suspicious_ips.map((ip) => {
                  const pct = Math.min(100, ip.incident_count * 12 + 30);
                  return (
                    <div key={ip.source_ip} className="ip-row">
                      <div>
                        <div className="ip-name">{ip.source_ip}</div>
                        <div className="ip-events">{ip.incident_count} incident{ip.incident_count !== 1 ? 's' : ''} · max {sevName(ip.highest_severity)}</div>
                      </div>
                      <div className="ip-bar"><span style={{ width: `${pct}%`, background: sevColor(ip.highest_severity) }} /></div>
                      <div className="ip-risk">{pct}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
