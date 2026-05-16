import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, Sliders, Bell, Shield, Database, Users, User } from 'lucide-react';
import { PageHead } from '../components/ui/PageHead';
import { UserChip } from '../components/ui/UserChip';
import { useProfile } from '../hooks/useProfile';

const STYLES = `
.settings-page { display: flex; flex-direction: column; min-height: 100%; }
.settings-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 32px 48px 24px; border-bottom: 1px solid var(--color-line-soft); }
.settings-bd { padding: 28px 48px 40px; }

.settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 36px; align-items: start; }

.nav-side { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 2px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px; font-size: 13px; color: var(--color-text-mid); cursor: pointer; background: transparent; border: 0; font-family: inherit; text-align: left; }
.nav-item:hover { color: var(--color-text); background: rgba(255,255,255,0.03); }
.nav-item.active { color: var(--color-text); background: var(--color-card); }
.nav-item svg { color: var(--color-text-dim); flex-shrink: 0; }
.nav-item.active svg { color: var(--color-accent); }

.section { background: var(--color-panel); padding: 28px 32px; }
.section + .section { margin-top: 22px; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 18px; margin-bottom: 22px; border-bottom: 1px solid var(--color-line-soft); }
.section-head h2 { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: var(--color-text); margin: 0; }
.section-head p { font-size: 12px; color: var(--color-text-dim); margin: 4px 0 0; }
.section-head .meta { font-size: 11px; color: var(--color-text-dim); font-family: var(--font-mono); }

.field { display: grid; grid-template-columns: 220px 1fr; gap: 28px; padding: 18px 0; border-bottom: 1px solid var(--color-line-soft); align-items: start; }
.field:last-child { border-bottom: 0; }
.field .label { font-size: 13px; color: var(--color-text); font-weight: 500; }
.field .hint { font-size: 11px; color: var(--color-text-dim); margin-top: 4px; line-height: 1.55; }
.field code { font-family: var(--font-mono); color: var(--color-text); font-size: 11px; }

input.in, select.in, textarea.in {
  background: var(--color-bg-app);
  border: 1px solid var(--color-line);
  color: var(--color-text);
  padding: 9px 12px;
  font-size: 13px;
  font-family: inherit;
  width: 100%;
}
input.in:focus, select.in:focus, textarea.in:focus { outline: none; border-color: var(--color-accent); }
.in.mono { font-family: var(--font-mono); }

.toggle { width: 38px; height: 22px; background: var(--color-card); border: 1px solid var(--color-line); position: relative; cursor: pointer; }
.toggle .knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: var(--color-text-dim); transition: all 0.15s; }
.toggle.on { background: rgba(75,108,246,0.18); border-color: var(--color-accent); }
.toggle.on .knob { left: 18px; background: var(--color-accent); }

.seg { display: inline-flex; border: 1px solid var(--color-line); }
.seg button { background: transparent; color: var(--color-text-dim); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; padding: 6px 11px; cursor: pointer; border: 0; border-right: 1px solid var(--color-line); }
.seg button:last-child { border-right: 0; }
.seg button.active { background: var(--color-card); color: var(--color-text); }

.btn { background: transparent; border: 1px solid var(--color-line); padding: 9px 14px; color: var(--color-text); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; gap: 8px; align-items: center; }
.btn:hover { background: var(--color-card); }
.btn.primary { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.btn.primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
.btn.danger  { background: rgba(239,91,107,0.08); border-color: rgba(239,91,107,0.4); color: var(--color-danger); }
.btn.danger:hover  { background: rgba(239,91,107,0.14); }

.saved-bar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding-top: 16px; }
.saved-msg { font-size: 11px; color: var(--color-success); font-family: var(--font-mono); }
`;

type Tab = 'profile' | 'general' | 'ai' | 'alerts' | 'integrations' | 'team' | 'danger';

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'profile',      icon: User,     label: 'Profile'      },
  { id: 'general',      icon: Sliders,  label: 'Workspace'    },
  { id: 'ai',           icon: Shield,   label: 'AI behaviour' },
  { id: 'alerts',       icon: Bell,     label: 'Alerts'       },
  { id: 'integrations', icon: Database, label: 'Integrations' },
  { id: 'team',         icon: Users,    label: 'Team & access'},
  { id: 'danger',       icon: Shield,   label: 'Danger zone'  },
];

export function Settings() {
  const location = useLocation();
  const [tab, setTab] = useState<Tab>(
    (location.state as { tab?: Tab } | null)?.tab ?? 'profile'
  );
  const { profile, setProfile } = useProfile();
  const [draftName,     setDraftName]     = useState(profile.name);
  const [draftInitials, setDraftInitials] = useState(profile.initials);
  const [draftEmail,    setDraftEmail]    = useState(profile.email);
  const [draftRole,     setDraftRole]     = useState(profile.role);
  const [wsName, setWsName] = useState('acme-security');
  const [retention, setRetention] = useState('90');
  const [aiMode, setAiMode] = useState<'explain' | 'detect'>('explain');
  const [autoSummary, setAutoSummary] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pagerDuty, setPagerDuty] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-page">
      <style>{STYLES}</style>

      <div className="settings-hd">
        <PageHead
          eyebrow={`Workspace · ${wsName}`}
          title="Settings"
          subtitle="Configure how LogLens analyzes logs, generates AI summaries, and handles approvals. Changes apply workspace-wide."
          right={<UserChip />}
        />
      </div>

      <div className="settings-bd">
      <div className="settings-layout">
        {/* SIDE NAV */}
        <nav className="nav-side">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              <Icon size={16} strokeWidth={1.7} /> {label}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <div>
          {tab === 'profile' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Your profile</h2>
                  <p>Personal details shown across LogLens. Visible to your workspace members.</p>
                </div>
              </div>

              {/* Avatar preview */}
              <div className="field">
                <div>
                  <div className="label">Avatar</div>
                  <div className="hint">Generated from your initials. Update them below to change it.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52, height: 52,
                    background: 'linear-gradient(135deg, #6e7484, #3a4150)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                    letterSpacing: '0.04em', flexShrink: 0,
                  }}>
                    {draftInitials || '??'}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>
                    Initials are auto-generated — change them in the field below.
                  </span>
                </div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Display name</div>
                  <div className="hint">Your full name as shown in the audit log and team list.</div>
                </div>
                <input
                  className="in"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="field">
                <div>
                  <div className="label">Initials</div>
                  <div className="hint">2 characters shown in your avatar. Uppercase recommended.</div>
                </div>
                <input
                  className="in mono"
                  value={draftInitials}
                  maxLength={2}
                  onChange={(e) => setDraftInitials(e.target.value.toUpperCase())}
                  placeholder="SC"
                  style={{ maxWidth: 80 }}
                />
              </div>

              <div className="field">
                <div>
                  <div className="label">Email</div>
                  <div className="hint">Used for alert notifications and your account identity.</div>
                </div>
                <input
                  className="in"
                  type="email"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="you@company.io"
                />
              </div>

              <div className="field">
                <div>
                  <div className="label">Role / Title</div>
                  <div className="hint">Shown on your profile card and in workspace member lists.</div>
                </div>
                <input
                  className="in"
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  placeholder="e.g. Security engineer"
                />
              </div>

              <div className="saved-bar">
                {saved && <span className="saved-msg">Saved · just now</span>}
                <button
                  className="btn primary"
                  onClick={() => {
                    setProfile({ name: draftName, initials: draftInitials, email: draftEmail, role: draftRole });
                    save();
                  }}
                >
                  <Save size={12} strokeWidth={2.5} /> Save profile
                </button>
              </div>
            </div>
          )}

          {tab === 'general' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Workspace</h2>
                  <p>Identity and retention defaults used across the product.</p>
                </div>
                <div className="meta">Last updated 2d ago</div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Workspace slug</div>
                  <div className="hint">Used as the org name in routes and audit logs. Lowercase, dashes only.</div>
                </div>
                <input className="in mono" value={wsName} onChange={(e) => setWsName(e.target.value)} />
              </div>

              <div className="field">
                <div>
                  <div className="label">Log retention</div>
                  <div className="hint">Raw uploads and parsed events are deleted after this many days. Incidents and audit log persist.</div>
                </div>
                <select className="in" value={retention} onChange={(e) => setRetention(e.target.value)}>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              </div>

              <div className="field">
                <div>
                  <div className="label">Time zone</div>
                  <div className="hint">All timestamps in the UI use this zone. Logs are stored in UTC.</div>
                </div>
                <select className="in" defaultValue="UTC">
                  <option>UTC</option>
                  <option>America/Los_Angeles</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                  <option>Asia/Singapore</option>
                </select>
              </div>

              <div className="saved-bar">
                {saved && <span className="saved-msg">Saved · just now</span>}
                <button className="btn primary" onClick={save}><Save size={12} strokeWidth={2.5} /> Save changes</button>
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>AI behaviour</h2>
                  <p>The model interprets evidence — it never decides what counts as suspicious.</p>
                </div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Mode</div>
                  <div className="hint"><strong style={{ color: 'var(--color-text)' }}>Explain</strong> generates summaries from rule-detected incidents only. <strong style={{ color: 'var(--color-text)' }}>Detect</strong> additionally lets the model raise its own incidents (not recommended in production).</div>
                </div>
                <div className="seg">
                  <button className={aiMode === 'explain' ? 'active' : ''} onClick={() => setAiMode('explain')}>Explain</button>
                  <button className={aiMode === 'detect' ? 'active' : ''} onClick={() => setAiMode('detect')}>Detect</button>
                </div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Auto-generate summary</div>
                  <div className="hint">Run the AI summary as soon as an incident is created. Disable to save tokens.</div>
                </div>
                <div className={`toggle ${autoSummary ? 'on' : ''}`} onClick={() => setAutoSummary((v) => !v)}><div className="knob" /></div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Require approval for actions</div>
                  <div className="hint">AI-recommended actions cannot be executed automatically — a human must click approve.</div>
                </div>
                <div className={`toggle ${requireApproval ? 'on' : ''}`} onClick={() => setRequireApproval((v) => !v)}><div className="knob" /></div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Default model</div>
                  <div className="hint">Used when an environment variable isn't set. Falls back to mock summary in dev.</div>
                </div>
                <select className="in" defaultValue="gpt-4o-mini">
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="claude-haiku-4-5">claude-haiku-4-5</option>
                  <option value="mock">Mock (development)</option>
                </select>
              </div>

              <div className="saved-bar">
                {saved && <span className="saved-msg">Saved</span>}
                <button className="btn primary" onClick={save}><Save size={12} strokeWidth={2.5} /> Save changes</button>
              </div>
            </div>
          )}

          {tab === 'alerts' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Alerts</h2>
                  <p>Notify the on-call rotation when high-risk incidents are detected.</p>
                </div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Email alerts</div>
                  <div className="hint">Sent to the on-call rotation address for critical and high-severity incidents.</div>
                </div>
                <div className={`toggle ${emailAlerts ? 'on' : ''}`} onClick={() => setEmailAlerts((v) => !v)}><div className="knob" /></div>
              </div>

              <div className="field">
                <div>
                  <div className="label">PagerDuty integration</div>
                  <div className="hint">Create a PagerDuty incident for any LogLens incident with risk ≥ 80.</div>
                </div>
                <div className={`toggle ${pagerDuty ? 'on' : ''}`} onClick={() => setPagerDuty((v) => !v)}><div className="knob" /></div>
              </div>

              <div className="field">
                <div>
                  <div className="label">Quiet hours</div>
                  <div className="hint">Low and medium incidents are batched into a daily digest during quiet hours.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="in mono" defaultValue="22:00" style={{ width: 100 }} />
                  <span style={{ alignSelf: 'center', color: 'var(--color-text-dim)' }}>→</span>
                  <input className="in mono" defaultValue="07:00" style={{ width: 100 }} />
                </div>
              </div>

              <div className="saved-bar">
                {saved && <span className="saved-msg">Saved</span>}
                <button className="btn primary" onClick={save}><Save size={12} strokeWidth={2.5} /> Save changes</button>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Integrations</h2>
                  <p>Connect LogLens to your existing security tooling.</p>
                </div>
              </div>
              <div className="field">
                <div><div className="label">Slack</div><div className="hint">Post AI summaries to a Slack channel for review.</div></div>
                <button className="btn">Connect Slack</button>
              </div>
              <div className="field">
                <div><div className="label">Splunk HEC</div><div className="hint">Forward incidents to a Splunk HTTP Event Collector.</div></div>
                <button className="btn">Configure</button>
              </div>
              <div className="field">
                <div><div className="label">SIEM webhook</div><div className="hint">POST incidents as JSON to any HTTPS endpoint.</div></div>
                <input className="in mono" placeholder="https://siem.example.com/webhook" />
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Team &amp; access</h2>
                  <p>Manage who can view incidents and approve AI-recommended actions.</p>
                </div>
                <button className="btn">Invite member</button>
              </div>
              <div className="field">
                <div><div className="label">Sarah Chen</div><div className="hint">sarah.chen@acme.io · owner</div></div>
                <div style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>You</div>
              </div>
              <div className="field">
                <div><div className="label">Marcus Webb</div><div className="hint">marcus.webb@acme.io · admin</div></div>
                <button className="btn">Remove</button>
              </div>
              <div className="field">
                <div><div className="label">Priya Rao</div><div className="hint">priya.rao@acme.io · viewer</div></div>
                <button className="btn">Remove</button>
              </div>
            </div>
          )}

          {tab === 'danger' && (
            <div className="section">
              <div className="section-head">
                <div>
                  <h2>Danger zone</h2>
                  <p>Irreversible actions. Read carefully before clicking.</p>
                </div>
              </div>
              <div className="field">
                <div><div className="label">Reset analyzer database</div><div className="hint">Removes all uploaded logs, events, incidents and AI summaries. Audit log is preserved.</div></div>
                <button className="btn danger">Reset analyzer</button>
              </div>
              <div className="field">
                <div><div className="label">Delete workspace</div><div className="hint">Permanently deletes <code>{wsName}</code> and all associated data. Cannot be undone.</div></div>
                <button className="btn danger">Delete workspace</button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
