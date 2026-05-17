import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Bell, Menu, X,
  ShieldAlert, AlertTriangle, FileCheck, CheckCircle2,
} from 'lucide-react';
import { getIncidents } from '../../api/incidents';
import type { Incident } from '../../types';

const SEEN_KEY = 'loglens-seen-incident-ids';

const RULE_SHORT: Record<string, string> = {
  brute_force_failed_logins:       'Brute-force',
  sensitive_username_targeted:     'Sensitive username',
  successful_login_after_failures: 'Login after failures',
  username_enumeration:            'Username enumeration',
};

function sevToNotifType(s: string): Notif['type'] {
  if (s === 'critical') return 'critical';
  if (s === 'high')     return 'high';
  if (s === 'medium')   return 'info';
  return 'success';
}

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function incidentToNotif(inc: Incident): Notif {
  const body = inc.source_ip
    ? `${inc.source_ip} · ${RULE_SHORT[inc.detection_rule] ?? inc.detection_rule}`
    : `${inc.username ?? 'Unknown'} · ${RULE_SHORT[inc.detection_rule] ?? inc.detection_rule}`;
  return {
    id:   inc.id,
    type: sevToNotifType(inc.severity),
    title: inc.title,
    body,
    time: relTime(inc.created_at),
    read: false,
  };
}

function loadSeen(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {}
  return new Set();
}

function saveSeen(ids: Set<number>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...ids])); } catch {}
}

function OverviewIcon({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256">
      <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208ZM160,88H96a8,8,0,0,0-8,8v64a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V96A8,8,0,0,0,160,88Zm-8,64H104V104h48Z" />
    </svg>
  );
}

function AISummariesIcon({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256">
      <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.15L64,208.94l28.42,14.21a8,8,0,0,0,7.16,0L128,208.94l28.42,14.21a8,8,0,0,0,7.16,0L192,208.94l28.42,14.21A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM136,112a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H144A8,8,0,0,1,136,112Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144ZM64,168h48a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v64A8,8,0,0,0,64,168Zm8-64h32v48H72Z" />
    </svg>
  );
}

function LogsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256">
      <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,16V152h-28.7A15.86,15.86,0,0,0,168,156.69L148.69,176H107.31L88,156.69A15.86,15.86,0,0,0,76.69,152H48V48Zm0,160H48V168H76.69L96,187.31A15.86,15.86,0,0,0,107.31,192h41.38A15.86,15.86,0,0,0,160,187.31L179.31,168H208v40ZM90.34,109.66a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,91.31V152a8,8,0,0,1-16,0V91.31l-18.34,18.35A8,8,0,0,1,90.34,109.66Z" />
    </svg>
  );
}

function AuditIcon({ size = 22 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256">
      <path d="M168,128a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,128Zm-8,24H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16ZM216,40V200a32,32,0,0,1-32,32H72a32,32,0,0,1-32-32V40a8,8,0,0,1,8-8H72V24a8,8,0,0,1,16,0v8h32V24a8,8,0,0,1,16,0v8h32V24a8,8,0,0,1,16,0v8h24A8,8,0,0,1,216,40Zm-16,8H184v8a8,8,0,0,1-16,0V48H136v8a8,8,0,0,1-16,0V48H88v8a8,8,0,0,1-16,0V48H56V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16Z" />
    </svg>
  );
}

interface NavItem { to: string; icon: React.ElementType; label: string; end?: boolean; }

const NAV: NavItem[] = [
  { to: '/',          icon: OverviewIcon,    label: 'Overview',     end: true },
  { to: '/incidents', icon: AISummariesIcon, label: 'AI Summaries'            },
  { to: '/upload',    icon: LogsIcon,        label: 'Logs'                    },
  { to: '/audit',     icon: AuditIcon,       label: 'Audit Log'               },
];

interface Notif {
  id: number;
  type: 'critical' | 'high' | 'info' | 'success';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INIT_NOTIFS: Notif[] = [];

const NOTIF_COLOR: Record<Notif['type'], string> = {
  critical: 'var(--color-danger)',
  high:     'var(--color-info)',
  info:     'var(--color-accent)',
  success:  'var(--color-success)',
};

const NOTIF_ICON: Record<Notif['type'], React.ElementType> = {
  critical: ShieldAlert,
  high:     AlertTriangle,
  info:     FileCheck,
  success:  CheckCircle2,
};

const COLLAPSED_W = 69;
const EXPANDED_W  = 210;

const STYLES = `
/* ── pulsing badge ─────────────────────────────── */
.notif-badge {
  animation: badge-glow 2.2s ease-in-out infinite;
}
@keyframes badge-glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(249,229,71,0.75); }
  50%      { box-shadow: 0 0 0 5px rgba(249,229,71,0); }
}

/* ── slide-in panel ────────────────────────────── */
.notif-panel {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 300px;
  background: var(--color-panel);
  border-right: 1px solid var(--color-line);
  z-index: 50;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 32px rgba(0,0,0,0.22);
  animation: notif-in 0.18s ease;
}
@keyframes notif-in {
  from { transform: translateX(-10px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
.notif-hd {
  padding: 20px 18px 14px;
  border-bottom: 1px solid var(--color-line-soft);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.notif-hd h3 {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex: 1;
}
.notif-count {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(249,229,71,0.15);
  color: var(--color-warn);
  letter-spacing: 0.06em;
}
.notif-mark {
  background: none; border: none;
  font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase;
  font-weight: 600; color: var(--color-accent);
  cursor: pointer; font-family: inherit; padding: 0;
}
.notif-mark:hover { color: var(--color-accent-hover); }
.notif-x {
  background: none; border: none;
  color: var(--color-text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 2px;
}
.notif-x:hover { color: var(--color-text); }

.notif-list { flex: 1; overflow-y: auto; padding: 6px 0; }

.notif-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px 18px; cursor: pointer;
  transition: background 0.12s; position: relative;
}
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item.unread { background: rgba(75,108,246,0.05); }
.notif-item.unread:hover { background: rgba(75,108,246,0.08); }

.notif-unread-dot {
  position: absolute; top: 17px; right: 17px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--color-accent);
}

.notif-icon {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; flex-shrink: 0;
}
.notif-body-wrap { flex: 1; min-width: 0; padding-right: 10px; }
.notif-title-txt {
  font-size: 12px; font-weight: 600; color: var(--color-text);
  margin: 0 0 3px; line-height: 1.35;
}
.notif-body-txt {
  font-size: 11px; color: var(--color-text-mid);
  margin: 0 0 5px; line-height: 1.45;
  font-family: var(--font-mono);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.notif-time-txt { font-size: 10px; color: var(--color-text-dim); letter-spacing: 0.06em; }

.notif-empty { padding: 48px 20px; text-align: center; color: var(--color-text-dim); font-size: 12px; }

.notif-footer {
  padding: 11px 18px;
  border-top: 1px solid var(--color-line-soft);
  font-size: 10px; color: var(--color-text-faint);
  text-align: center; letter-spacing: 0.10em; text-transform: uppercase;
  flex-shrink: 0;
}
`;

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(INIT_NOTIFS);
  const panelRef    = useRef<HTMLDivElement>(null);
  const seenIds     = useRef<Set<number>>(loadSeen());
  const isFirstPoll = useRef(true);

  const unread = notifs.filter((n) => !n.read).length;
  const sidebarW = expanded ? EXPANDED_W : COLLAPSED_W;

  function isActive(to: string, end?: boolean) {
    if (to === '/audit')     return pathname === '/audit' || pathname === '/reports';
    if (to === '/incidents') return pathname.startsWith('/incidents');
    return end ? pathname === to : pathname.startsWith(to);
  }

  function markAllRead() { setNotifs((p) => p.map((n) => ({ ...n, read: true }))); }
  function markRead(id: number) { setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n)); }

  useEffect(() => {
    if (!showNotifs) return;
    function onDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [showNotifs]);

  // Poll for new incidents every 30 s and surface as notifications
  useEffect(() => {
    async function poll() {
      try {
        const incidents = await getIncidents();

        if (isFirstPoll.current) {
          isFirstPoll.current = false;
          if (seenIds.current.size === 0) {
            // First-ever visit — mark everything seen so we don't flood
            incidents.forEach((inc) => seenIds.current.add(inc.id));
            saveSeen(seenIds.current);
            return;
          }
        }

        const fresh = incidents.filter((inc) => !seenIds.current.has(inc.id));
        if (fresh.length === 0) return;

        fresh.forEach((inc) => seenIds.current.add(inc.id));
        saveSeen(seenIds.current);
        setNotifs((prev) => [...fresh.map(incidentToNotif), ...prev].slice(0, 20));
      } catch {
        // Notifications are non-critical — fail silently
      }
    }

    poll();
    const t = setInterval(poll, 30_000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Shared label transition — fades in slightly after width starts expanding
  const labelStyle: React.CSSProperties = {
    opacity:   expanded ? 1 : 0,
    maxWidth:  expanded ? '160px' : '0px',
    overflow:  'hidden',
    whiteSpace: 'nowrap',
    fontSize:  13,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    transition: expanded
      ? 'opacity 0.15s ease 0.1s, max-width 0.22s ease'
      : 'opacity 0.08s ease, max-width 0.22s ease',
  };

  // Nav / bottom button shared layout style
  function btnLayout(active = false): React.CSSProperties {
    return {
      display:        'flex',
      alignItems:     'center',
      justifyContent: expanded ? 'flex-start' : 'center',
      gap:            expanded ? '10px' : '0px',
      padding:        expanded ? '0 14px' : '0',
      width:          expanded ? '100%' : '44px',
      height:         '44px',
      border:         'none',
      cursor:         'pointer',
      fontFamily:     'inherit',
      flexShrink:     0,
      color:           active ? 'white' : 'var(--color-text-dim)',
      backgroundColor: active ? 'var(--color-accent)' : 'transparent',
      boxShadow:       active ? '0 6px 16px -6px rgba(75,108,246,0.6)' : 'none',
      transition:      'background 0.15s, color 0.15s, width 0.22s ease, padding 0.22s ease, gap 0.22s ease',
    };
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Notifications panel (left offset tracks sidebar width) ── */}
      {showNotifs && (
        <div className="notif-panel" ref={panelRef} style={{ left: sidebarW }}>
          <div className="notif-hd">
            <h3>Notifications</h3>
            {unread > 0 && <span className="notif-count">{unread} new</span>}
            {unread > 0 && <button className="notif-mark" onClick={markAllRead}>Mark all read</button>}
            <button className="notif-x" onClick={() => setShowNotifs(false)}><X size={14} strokeWidth={2} /></button>
          </div>

          <div className="notif-list">
            {notifs.length === 0
              ? <div className="notif-empty">No notifications</div>
              : notifs.map((n) => {
                  const Icon  = NOTIF_ICON[n.type];
                  const color = NOTIF_COLOR[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`notif-item ${n.read ? '' : 'unread'}`}
                      onClick={() => markRead(n.id)}
                    >
                      {!n.read && <div className="notif-unread-dot" />}
                      <div className="notif-icon" style={{ background: `${color}1a` }}>
                        <Icon size={14} strokeWidth={2} style={{ color }} />
                      </div>
                      <div className="notif-body-wrap">
                        <p className="notif-title-txt">{n.title}</p>
                        <p className="notif-body-txt">{n.body}</p>
                        <span className="notif-time-txt">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
          </div>

          <div className="notif-footer">LogLens AI · security alerts only</div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 py-5 h-screen overflow-hidden"
        style={{
          width:           sidebarW,
          backgroundColor: 'var(--color-rail)',
          alignItems:      expanded ? 'flex-start' : 'center',
          transition:      'width 0.22s ease, align-items 0s',
        }}
      >
        {/* Burger */}
        <button
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => setExpanded((v) => !v)}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            width:          expanded ? '100%' : '28px',
            height:         '28px',
            padding:        expanded ? '0 22px' : '0',
            marginBottom:   '24px',
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            color:          'var(--color-text-mid)',
            flexShrink:     0,
            transition:     'color 0.15s, width 0.22s ease, padding 0.22s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-mid)'; }}
        >
          <Menu size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
        </button>

        {/* Nav — vertically centered */}
        <nav
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     expanded ? 'stretch' : 'center',
            gap:            4,
            flex:           1,
            justifyContent: 'center',
            width:          '100%',
            padding:        expanded ? '0 8px' : '0',
            transition:     'padding 0.22s ease',
          }}
        >
          {NAV.map(({ to, icon: Icon, label, end }) => {
            const active = isActive(to, end);
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                title={label}
                style={btnLayout(active)}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-dim)'; }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <Icon size={22} />
                </span>
                <span style={labelStyle}>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom — bell + settings */}
        <div
          style={{
            display:       'flex',
            flexDirection: 'column',
            alignItems:    expanded ? 'stretch' : 'center',
            gap:           8,
            width:         '100%',
            padding:       expanded ? '0 8px' : '0',
            transition:    'padding 0.22s ease',
          }}
        >
          {/* Bell */}
          <button
            title={unread > 0 ? `Notifications · ${unread} new` : 'Notifications'}
            onClick={() => setShowNotifs((v) => !v)}
            style={{
              ...btnLayout(),
              height: '36px',
              width:  expanded ? '100%' : '36px',
              color:  unread > 0 ? 'var(--color-warn)' : 'var(--color-text-dim)',
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (!unread) e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = unread > 0 ? 'var(--color-warn)' : 'var(--color-text-dim)'; }}
          >
            {/* Badge anchored to icon, not the full button */}
            <span style={{ position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Bell size={20} strokeWidth={1.8} />
              {unread > 0 && (
                <span
                  className="notif-badge"
                  style={{
                    position:        'absolute',
                    top:             -2,
                    right:           -2,
                    width:           17,
                    height:          17,
                    borderRadius:    '50%',
                    backgroundColor: 'var(--color-warn)',
                    color:           '#1a1000',
                    fontSize:        9,
                    fontWeight:      700,
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    fontFamily:      'var(--font-sans)',
                    lineHeight:      1,
                  }}
                >
                  {unread}
                </span>
              )}
            </span>
            <span style={labelStyle}>
              Notifications{unread > 0 ? ` (${unread})` : ''}
            </span>
          </button>

          {/* Settings */}
          {(() => {
            const active = isActive('/settings');
            return (
              <button
                onClick={() => navigate('/settings')}
                title="Settings"
                style={btnLayout(active)}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--color-text-dim)'; }}
              >
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon size={22} strokeWidth={1.8} />
                </span>
                <span style={labelStyle}>Settings</span>
              </button>
            );
          })()}
        </div>
      </aside>
    </>
  );
}
