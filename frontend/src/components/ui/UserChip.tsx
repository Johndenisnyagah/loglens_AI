import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import {
  ChevronDown, User, Settings as SettingsIcon, Keyboard,
  HelpCircle, FileText, LogOut, ArrowLeft, Plus, Check,
} from 'lucide-react';

const STYLES = `
.userchip-root { position: relative; }

.userchip-btn {
  background: rgba(255,255,255,0.06);
  padding: 7px 14px 7px 7px;
  display: flex; align-items: center; gap: 12px;
  color: var(--color-text-mid);
  font-size: 13px;
  cursor: pointer;
  border: 0;
  font-family: inherit;
  transition: background 0.15s;
}
.userchip-btn:hover { background: rgba(255,255,255,0.09); }
.userchip-btn.open { background: var(--color-panel); }

.userchip-avatar {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #6e7484, #3a4150);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.userchip-info { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; text-align: left; }
.userchip-info .name { font-size: 13px; color: var(--color-text); font-weight: 500; }
.userchip-info .org  { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-dim); letter-spacing: 0.04em; }
.userchip-chev { color: var(--color-text-dim); transition: transform 0.15s; flex-shrink: 0; }
.userchip-btn.open .userchip-chev { transform: rotate(180deg); color: var(--color-text); }

.userchip-pop {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  box-shadow: 0 24px 60px -20px rgba(0,0,0,0.7), 0 8px 20px -10px rgba(0,0,0,0.5);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.pop-header {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 18px 18px 16px;
  border-bottom: 1px solid var(--color-line-soft);
}
.pop-header .userchip-avatar { width: 44px; height: 44px; font-size: 13px; }
.pop-header .meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.pop-header .name { font-size: 14px; color: var(--color-text); font-weight: 600; letter-spacing: -0.005em; }
.pop-header .email { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-dim); letter-spacing: 0.02em; word-break: break-all; }
.pop-header .role {
  margin-top: 4px;
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; font-weight: 600;
  padding: 3px 8px;
  border: 1px solid rgba(93,211,158,0.4);
  color: var(--color-success);
  background: rgba(93,211,158,0.05);
}

.pop-section { padding: 10px 0; border-bottom: 1px solid var(--color-line-soft); }
.pop-section:last-child { border-bottom: 0; }
.section-label {
  font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--color-text-dim); font-weight: 500;
  padding: 6px 18px 8px;
}

.pop-link, .ws-item {
  display: flex; align-items: center; gap: 12px;
  padding: 9px 18px;
  color: var(--color-text-mid);
  font-size: 13px;
  text-decoration: none;
  border: 0; background: transparent;
  font-family: inherit;
  cursor: pointer;
  width: 100%; text-align: left;
}
.pop-link:hover, .ws-item:hover { background: rgba(255,255,255,0.03); color: var(--color-text); }
.pop-link svg, .ws-item .ws-icon { width: 16px; height: 16px; color: var(--color-text-dim); flex-shrink: 0; }
.pop-link .label, .ws-item .ws-name { flex: 1; }
.pop-link kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-faint);
  border: 1px solid var(--color-line-soft);
  padding: 2px 6px;
  background: var(--color-bg-app);
  letter-spacing: 0.04em;
}
.pop-link.signout { color: var(--color-danger); }
.pop-link.signout svg { color: var(--color-danger); }
.pop-link.signout:hover { background: rgba(239,91,107,0.06); }
.new-dot { width: 6px; height: 6px; background: var(--color-accent); display: inline-block; }

.ws-item .ws-icon {
  width: 26px; height: 26px;
  background: var(--color-bg-app);
  color: var(--color-text-mid);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px; font-weight: 700;
  border: 1px solid var(--color-line-soft);
}
.ws-item.active .ws-icon { color: var(--color-accent); border-color: var(--color-accent); }
.ws-item .check { color: var(--color-accent); }
.ws-item.add { color: var(--color-text-dim); font-size: 12px; gap: 10px; }
.ws-item.add:hover { color: var(--color-text); }

.ws-add-form { padding: 6px 18px 12px; display: flex; gap: 8px; }
.ws-add-form input {
  flex: 1; background: var(--color-bg-app); border: 1px solid var(--color-line);
  color: var(--color-text); font-size: 12px; font-family: inherit; padding: 6px 10px; outline: none;
}
.ws-add-form input:focus { border-color: var(--color-accent); }
.ws-add-form button {
  background: var(--color-accent); border: 0; color: white;
  font-size: 11px; font-weight: 600; font-family: inherit;
  padding: 6px 12px; cursor: pointer; letter-spacing: 0.06em;
}
.ws-add-form button:hover { background: var(--color-accent-hover); }

.theme-row, .status-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px;
  gap: 14px;
}
.theme-row > span:first-child { font-size: 12px; color: var(--color-text-mid); }
.theme-seg { display: flex; border: 1px solid var(--color-line-soft); }
.theme-seg button {
  background: transparent; border: 0;
  color: var(--color-text-dim);
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  font-weight: 600;
  padding: 5px 9px;
  cursor: pointer;
  border-right: 1px solid var(--color-line-soft);
}
.theme-seg button:last-child { border-right: 0; }
.theme-seg button.active { color: var(--color-text); background: var(--color-bg-app); }

.status-row .light {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s, box-shadow 0.2s;
}
.status-row .light.oncall { background: var(--color-success); box-shadow: 0 0 0 3px rgba(93,211,158,0.18); }
.status-row .light.offcall { background: var(--color-text-faint); box-shadow: none; }
.status-row .body { flex: 1; font-size: 12px; color: var(--color-text-mid); }
.status-row .body small { display: block; color: var(--color-text-dim); font-size: 11px; margin-top: 2px; }
.status-row .swap {
  font-family: var(--font-mono);
  font-size: 10px; letter-spacing: 0.12em;
  text-transform: uppercase; font-weight: 600;
  color: var(--color-text-dim);
  background: transparent; border: 1px solid var(--color-line-soft);
  padding: 4px 8px; cursor: pointer;
}
.status-row .swap:hover { color: var(--color-text); border-color: var(--color-line); }

/* Keyboard shortcuts panel */
.shortcuts-panel { padding: 0; }
.shortcuts-back {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-line-soft);
  font-size: 12px; color: var(--color-text-mid);
  background: transparent; border-left: 0; border-right: 0; border-top: 0;
  cursor: pointer; font-family: inherit; width: 100%; text-align: left;
}
.shortcuts-back:hover { color: var(--color-text); }
.shortcuts-list { padding: 8px 0 12px; }
.shortcut-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 18px; font-size: 12px; color: var(--color-text-mid);
}
.shortcut-row .action { flex: 1; }
.shortcut-keys { display: flex; gap: 4px; }
.shortcut-keys kbd {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--color-text); border: 1px solid var(--color-line);
  padding: 2px 7px; background: var(--color-bg-app); letter-spacing: 0.04em;
}

/* Sign-out overlay */
.signout-overlay {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 18px; gap: 10px;
  text-align: center;
}
.signout-overlay .msg { font-size: 13px; color: var(--color-text); font-weight: 500; }
.signout-overlay .sub { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-mono); }
`;

const SHORTCUTS = [
  { action: 'Go to Dashboard',       keys: ['G', 'D'] },
  { action: 'Go to Incidents',       keys: ['G', 'I'] },
  { action: 'Go to Upload',          keys: ['G', 'U'] },
  { action: 'Go to Audit log',       keys: ['G', 'A'] },
  { action: 'Go to Settings',        keys: ['G', 'S'] },
  { action: 'Show shortcuts',        keys: ['?'] },
  { action: 'Open search',           keys: ['/'] },
  { action: 'Close / dismiss',       keys: ['Esc'] },
];

type Theme = 'Dark' | 'Light' | 'System';
type View  = 'main' | 'shortcuts' | 'signout';

interface Workspace { id: string; name: string; }

interface Props {
  name?: string;
  initials?: string;
  email?: string;
  role?: string;
  defaultOrg?: string;
}

export function UserChip({
  name:     nameProp,
  initials: initialsProp,
  email:    emailProp,
  role:     roleProp,
  defaultOrg = 'acme-security',
}: Props) {
  const navigate = useNavigate();
  const rootRef  = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // Prop overrides fall back to persisted profile values
  const name     = nameProp     ?? profile.name;
  const initials = initialsProp ?? profile.initials;
  const email    = emailProp    ?? profile.email;
  const role     = roleProp     ?? profile.role;

  const [open,       setOpen]       = useState(false);
  const [view,       setView]       = useState<View>('main');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'AC', name: 'Acme Security' },
    { id: 'LB', name: 'Labs sandbox' },
    { id: 'CG', name: 'Contoso Gov demo' },
  ]);
  const [activeWs,   setActiveWs]   = useState('Acme Security');
  const [org,        setOrg]        = useState(defaultOrg);
  const [theme,      setTheme]      = useState<Theme>(() => {
    return (localStorage.getItem('loglens-theme') as Theme | null) ?? 'Dark';
  });
  const [onCall,     setOnCall]     = useState(true);
  const [newSeen,    setNewSeen]    = useState(false);
  const [addingWs,   setAddingWs]   = useState(false);
  const [newWsName,  setNewWsName]  = useState('');

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'System') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme.toLowerCase());
    }
    localStorage.setItem('loglens-theme', theme);
  }, [theme]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function close() { setOpen(false); setView('main'); setAddingWs(false); setNewWsName(''); }

  function selectWs(wsName: string) {
    setActiveWs(wsName);
    setOrg(wsName.toLowerCase().replace(/\s+/g, '-'));
    setAddingWs(false);
  }

  function addWorkspace() {
    const trimmed = newWsName.trim();
    if (!trimmed) return;
    const id = trimmed.slice(0, 2).toUpperCase();
    setWorkspaces((prev) => [...prev, { id, name: trimmed }]);
    selectWs(trimmed);
    setNewWsName('');
    setAddingWs(false);
  }

  function handleSignOut() {
    setView('signout');
    setTimeout(() => {
      close();
      navigate('/');
      window.location.reload();
    }, 1400);
  }

  function goTo(path: string) { close(); navigate(path); }

  return (
    <div ref={rootRef} className="userchip-root">
      <style>{STYLES}</style>

      {/* Trigger button */}
      <button
        className={`userchip-btn ${open ? 'open' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); if (open) close(); else setOpen(true); }}
      >
        <div className="userchip-avatar">{initials}</div>
        <div className="userchip-info">
          <div className="name">{name}</div>
          <div className="org">{org}</div>
        </div>
        <ChevronDown className="userchip-chev" size={12} strokeWidth={2} />
      </button>

      {open && (
        <div className="userchip-pop" role="menu">

          {/* ── Sign-out overlay ─────────────────────── */}
          {view === 'signout' && (
            <div className="signout-overlay">
              <div className="msg">Signing you out…</div>
              <div className="sub">Redirecting to home</div>
            </div>
          )}

          {/* ── Keyboard shortcuts panel ─────────────── */}
          {view === 'shortcuts' && (
            <div className="shortcuts-panel">
              <button className="shortcuts-back" onClick={() => setView('main')}>
                <ArrowLeft size={13} strokeWidth={2} /> Keyboard shortcuts
              </button>
              <div className="shortcuts-list">
                {SHORTCUTS.map(({ action, keys }) => (
                  <div key={action} className="shortcut-row">
                    <span className="action">{action}</span>
                    <span className="shortcut-keys">
                      {keys.map((k) => <kbd key={k}>{k}</kbd>)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Main panel ───────────────────────────── */}
          {view === 'main' && (
            <>
              {/* Header */}
              <div className="pop-header">
                <div className="userchip-avatar">{initials}</div>
                <div className="meta">
                  <div className="name">{name}</div>
                  <div className="email">{email}</div>
                  <span className="role">{role}</span>
                </div>
              </div>

              {/* Workspace switcher */}
              <div className="pop-section">
                <div className="section-label">Workspace</div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    className={`ws-item ${activeWs === ws.name ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); selectWs(ws.name); }}
                  >
                    <div className="ws-icon">{ws.id}</div>
                    <div className="ws-name">{ws.name}</div>
                    {activeWs === ws.name && <Check size={13} strokeWidth={2.5} className="check" />}
                  </button>
                ))}

                {addingWs ? (
                  <div className="ws-add-form" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      placeholder="Workspace name…"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addWorkspace(); if (e.key === 'Escape') setAddingWs(false); }}
                    />
                    <button onClick={addWorkspace}>Add</button>
                  </div>
                ) : (
                  <button className="ws-item add" onClick={(e) => { e.stopPropagation(); setAddingWs(true); }}>
                    <Plus size={14} strokeWidth={2} style={{ color: 'var(--color-text-dim)' }} />
                    Create new workspace
                  </button>
                )}
              </div>

              {/* Profile links */}
              <div className="pop-section">
                <button className="pop-link" onClick={() => { close(); navigate('/settings', { state: { tab: 'profile' } }); }}>
                  <User strokeWidth={1.7} /><span className="label">Your profile</span><kbd>P</kbd>
                </button>
                <button className="pop-link" onClick={() => goTo('/settings')}>
                  <SettingsIcon strokeWidth={1.7} /><span className="label">Workspace settings</span><kbd>,</kbd>
                </button>
                <button className="pop-link" onClick={(e) => { e.stopPropagation(); setView('shortcuts'); }}>
                  <Keyboard strokeWidth={1.7} /><span className="label">Keyboard shortcuts</span><kbd>?</kbd>
                </button>
                <button className="pop-link" onClick={(e) => { e.stopPropagation(); setNewSeen(true); }}>
                  <HelpCircle strokeWidth={1.7} /><span className="label">What's new</span>
                  {!newSeen && <span className="new-dot" />}
                </button>
                <button className="pop-link" onClick={() => window.open('https://github.com/Johndenisnyagah/loglens_AI', '_blank')}>
                  <FileText strokeWidth={1.7} /><span className="label">Help &amp; docs</span>
                </button>
              </div>

              {/* Appearance + on-call */}
              <div className="pop-section">
                <div className="theme-row">
                  <span>Appearance</span>
                  <div className="theme-seg">
                    {(['Dark', 'Light', 'System'] as Theme[]).map((t) => (
                      <button
                        key={t}
                        className={theme === t ? 'active' : ''}
                        onClick={(e) => { e.stopPropagation(); setTheme(t); }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="status-row">
                  <span className={`light ${onCall ? 'oncall' : 'offcall'}`} />
                  <div className="body">
                    {onCall ? 'On call this week' : 'Off call'}
                    <small>
                      {onCall
                        ? 'Rotation handover Fri 17:00 · paging via PagerDuty'
                        : 'Next rotation starts Monday 09:00'}
                    </small>
                  </div>
                  <button className="swap" onClick={(e) => { e.stopPropagation(); setOnCall((v) => !v); }}>
                    Swap
                  </button>
                </div>
              </div>

              {/* Sign out */}
              <div className="pop-section">
                <button className="pop-link signout" onClick={(e) => { e.stopPropagation(); handleSignOut(); }}>
                  <LogOut strokeWidth={1.7} /><span className="label">Sign out</span><kbd>⇧ Q</kbd>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
