import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ShieldAlert, Sparkles, Check, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { getLogs, uploadLogFile } from '../api/logs';
import type { LogFile, UploadResult } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHead } from '../components/ui/PageHead';
import { PillFilter } from '../components/ui/PillFilter';
import { UserChip } from '../components/ui/UserChip';

const STYLES = `
.logs-page { display: flex; flex-direction: column; min-height: 100%; }
.logs-hd { position: sticky; top: 0; z-index: 10; background: var(--color-bg-app); padding: 32px 48px 24px; border-bottom: 1px solid var(--color-line-soft); }
.logs-bd { padding: 28px 48px 40px; display: flex; flex-direction: column; gap: 28px; }

.upload-zone { border: 1px dashed var(--color-line); padding: 30px 32px; display: flex; align-items: center; gap: 22px; background: var(--color-panel); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.upload-zone:hover, .upload-zone.drag { border-color: var(--color-accent); background: rgba(75,108,246,0.04); }
.upload-icon { width: 56px; height: 56px; background: var(--color-accent); color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.upload-text h3 { font-size: 16px; font-weight: 600; color: var(--color-text); margin: 0 0 6px; letter-spacing: -0.01em; }
.upload-text p  { font-size: 12px; color: var(--color-text-dim); margin: 0; }
.upload-cta { margin-left: auto; }

.btn { background: transparent; border: 1px solid var(--color-line); padding: 10px 16px; color: var(--color-text); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; gap: 8px; align-items: center; }
.btn:hover { background: var(--color-card); }
.btn.primary { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.btn.primary:hover { background: var(--color-accent-hover); border-color: var(--color-accent-hover); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.tbl-wrap { background: var(--color-panel); }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { text-align: left; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text-dim); font-weight: 500; padding: 18px 20px 14px; border-bottom: 1px solid var(--color-line-soft); }
.tbl td { padding: 16px 20px; border-bottom: 1px solid var(--color-line-soft); color: var(--color-text-mid); }
.tbl tr:last-child td { border-bottom: 0; }
.tbl tr:hover td { background: rgba(255,255,255,0.02); color: var(--color-text); }

.fname { display: flex; align-items: center; gap: 10px; }
.fname-icon { width: 28px; height: 28px; background: var(--color-card); display: flex; align-items: center; justify-content: center; color: var(--color-text-mid); flex-shrink: 0; }
.fname-name { font-family: var(--font-mono); font-size: 13px; color: var(--color-text); }
.mono-dim { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-dim); }
.mono { font-family: var(--font-mono); color: var(--color-text); }

.status-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; padding: 4px 8px; border: 1px solid currentColor; }

.progress-card { background: var(--color-panel); padding: 24px 28px; }
.progress-card .head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.progress-card h3 { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text); margin: 0; }
.progress-card .filename { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-mid); margin-left: auto; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 28px; }
.step { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--color-text-dim); }
.step.done   { color: var(--color-success); font-weight: 500; }
.step.active { color: var(--color-text);    font-weight: 500; }

.tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.tip-card { background: var(--color-panel); padding: 22px 24px; display: flex; gap: 14px; align-items: flex-start; }
.tip-icon { width: 36px; height: 36px; background: var(--color-card); color: var(--color-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-text strong { display: block; color: var(--color-text); font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.tip-text span  { color: var(--color-text-mid); font-size: 12px; line-height: 1.55; }

.banner { padding: 16px 22px; display: flex; align-items: center; gap: 14px; font-size: 12px; }
.banner.success { background: rgba(93,211,158,0.06); border-left: 2px solid var(--color-success); color: var(--color-text-mid); }
.banner.error   { background: rgba(239,91,107,0.06); border-left: 2px solid var(--color-danger);  color: var(--color-text-mid); }
.banner strong { color: var(--color-text); font-weight: 600; margin-right: 6px; }
`;

const STEPS = [
  'Validating file',
  'Reading log lines',
  'Extracting timestamps, usernames & IPs',
  'Detecting failed login patterns',
  'Checking sensitive username targeting',
  'Checking login after failures',
  'Creating incidents',
  'Generating AI summaries',
  'Analysis complete',
];

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['.log', '.txt'];

type Phase = 'idle' | 'uploading' | 'done' | 'error';

const statusColor: Record<string, string> = {
  uploaded:   'var(--color-text-mid)',
  processing: 'var(--color-warn)',
  analyzed:   'var(--color-success)',
  failed:     'var(--color-danger)',
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export function UploadLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadList = () => {
    setLoadingList(true); setListError('');
    getLogs()
      .then(setLogs)
      .catch(() => setListError('Could not load logs.'))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadList(); }, []);

  function validate(file: File): string | null {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!ALLOWED.includes(ext)) return 'Only .log and .txt files are accepted.';
    if (file.size > MAX_SIZE)   return 'File must be under 10 MB.';
    if (file.size === 0)        return 'File is empty.';
    return null;
  }

  async function runUpload(file: File) {
    const err = validate(file);
    if (err) { setErrorMsg(err); setPhase('error'); return; }
    setPhase('uploading'); setErrorMsg(''); setResult(null);
    for (let i = 0; i < STEPS.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, i === 0 ? 250 : 360));
    }
    try {
      const data = await uploadLogFile(file);
      setCurrentStep(STEPS.length - 1); setResult(data); setPhase('done');
      loadList();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Upload failed.';
      setErrorMsg(msg); setPhase('error'); setCurrentStep(-1);
    }
  }

  const handleFiles = useCallback((files: FileList | null) => {
    const f = files?.[0]; if (f) { setSelectedFile(f); runUpload(f); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="logs-page">
      <style>{STYLES}</style>

      <div className="logs-hd">
        <PageHead
          eyebrow={`Logs · ${logs.length} files`}
          title="Logs"
          subtitle="Upload Linux SSH authentication logs and review LogLens's analysis history per file."
          right={<><PillFilter>All hosts</PillFilter><PillFilter>Last 30 days</PillFilter><UserChip /></>}
        />
      </div>

      <div className="logs-bd">
      {/* UPLOAD ZONE */}
      <div
        className={`upload-zone ${dragging ? 'drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('logs-file-input')?.click()}
      >
        <input id="logs-file-input" type="file" accept=".log,.txt" className="hidden" style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)} />
        <div className="upload-icon"><Upload size={24} strokeWidth={1.8} /></div>
        <div className="upload-text">
          <h3>{selectedFile?.name ?? 'Upload a log file'}</h3>
          <p>{selectedFile ? `${formatBytes(selectedFile.size)} · click to replace` : 'Drag .log or .txt here, or click to browse · max 10 MB'}</p>
        </div>
        <div className="upload-cta">
          <button className="btn primary">{selectedFile ? 'Replace' : 'Browse'} <ChevronRight size={12} strokeWidth={2.5} /></button>
        </div>
      </div>

      {/* PROGRESS / RESULT / ERROR */}
      {phase === 'uploading' && (
        <div className="progress-card">
          <div className="head">
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <h3>Analyzing</h3>
            <span className="filename">{selectedFile?.name}</span>
          </div>
          <div className="steps">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className={`step ${done ? 'done' : active ? 'active' : ''}`}>
                  {done   ? <Check size={14} strokeWidth={3} />
                  : active ? <Loader2 size={14} className="animate-spin" strokeWidth={2} />
                           : <span style={{ width: 14, height: 14, border: '1px solid var(--color-line)', display: 'inline-block' }} />}
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === 'done' && result && (
        <div className="banner success">
          <Check size={16} strokeWidth={3} style={{ color: 'var(--color-success)' }} />
          <span><strong>Analysis complete.</strong>Parsed {result.parsed_events_count} events from {result.total_lines} lines, created {result.incidents_created} incident{result.incidents_created !== 1 ? 's' : ''}.</span>
          <button className="btn primary" style={{ marginLeft: 'auto' }} onClick={() => navigate('/incidents')}>View incidents <ChevronRight size={12} strokeWidth={2.5} /></button>
        </div>
      )}

      {phase === 'error' && (
        <div className="banner error">
          <AlertCircle size={16} strokeWidth={2} style={{ color: 'var(--color-danger)' }} />
          <span><strong>Upload failed.</strong>{errorMsg}</span>
          <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => { setPhase('idle'); setErrorMsg(''); setSelectedFile(null); }}>Try again</button>
        </div>
      )}

      {/* LOG LIST */}
      <div className="tbl-wrap">
        {loadingList ? <LoadingState message="Loading logs…" />
        : listError ? <ErrorState message={listError} onRetry={loadList} />
        : logs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 13 }}>
            No log files yet. Upload one above to get started.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>File</th><th>Type</th><th>Lines</th><th>Events</th><th>Status</th><th style={{ textAlign: 'right' }}>Uploaded</th></tr>
            </thead>
            <tbody>
              {logs.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="fname">
                      <div className="fname-icon"><FileText size={14} strokeWidth={1.8} /></div>
                      <span className="fname-name">{f.filename}</span>
                    </div>
                  </td>
                  <td className="mono-dim">.{f.file_type}</td>
                  <td className="mono">{f.total_lines.toLocaleString()}</td>
                  <td className="mono">{f.parsed_events_count.toLocaleString()}</td>
                  <td><span className="status-pill" style={{ color: statusColor[f.status] ?? 'var(--color-text-mid)' }}>{f.status}</span></td>
                  <td className="mono-dim" style={{ textAlign: 'right' }}>{formatTime(f.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TIPS */}
      <div className="tips-grid">
        <div className="tip-card">
          <div className="tip-icon"><FileText size={16} strokeWidth={1.8} /></div>
          <div className="tip-text"><strong>Supports auth.log & syslog</strong><span>Linux SSH authentication logs and syslog-format files.</span></div>
        </div>
        <div className="tip-card">
          <div className="tip-icon"><ShieldAlert size={16} strokeWidth={1.8} /></div>
          <div className="tip-text"><strong>Deterministic detection</strong><span>Brute-force, enumeration, sensitive-username and post-failure success patterns.</span></div>
        </div>
        <div className="tip-card">
          <div className="tip-icon"><Sparkles size={16} strokeWidth={1.8} /></div>
          <div className="tip-text"><strong>AI explanations</strong><span>Every incident gets a plain-language summary, why it matters, and recommended actions.</span></div>
        </div>
      </div>
      </div>
    </div>
  );
}
