import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, CheckCircle2, Circle, Loader2,
  AlertCircle, ArrowRight, FileText, ShieldAlert, Sparkles,
} from 'lucide-react';
import { uploadLogFile } from '../api/logs';
import type { UploadResult } from '../types';

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

const TIPS = [
  { icon: FileText,    text: 'Supports Linux SSH auth.log and syslog files' },
  { icon: ShieldAlert, text: 'Detects brute-force, enumeration, and account compromise patterns' },
  { icon: Sparkles,    text: 'AI summaries generated for every incident found' },
];

type Phase = 'idle' | 'uploading' | 'done' | 'error';
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED  = ['.log', '.txt'];

export function UploadLogs() {
  const navigate = useNavigate();
  const [phase,        setPhase]        = useState<Phase>('idle');
  const [currentStep,  setCurrentStep]  = useState(-1);
  const [result,       setResult]       = useState<UploadResult | null>(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [dragging,     setDragging]     = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function validate(file: File): string | null {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
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
      await new Promise((r) => setTimeout(r, i === 0 ? 300 : 420));
    }
    try {
      const data = await uploadLogFile(file);
      setCurrentStep(STEPS.length - 1); setResult(data); setPhase('done');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Upload failed.';
      setErrorMsg(msg); setPhase('error'); setCurrentStep(-1);
    }
  }

  const handleFiles = useCallback((files: FileList | null) => {
    const f = files?.[0]; if (f) setSelectedFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  function reset() {
    setPhase('idle'); setCurrentStep(-1); setResult(null); setErrorMsg(''); setSelectedFile(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

      {/* ── Left: upload zone + progress ─────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Upload Logs</h1>
          <p className="text-sm text-[#7A92A8] mt-0.5">Analyze a Linux authentication log file</p>
        </div>

        {/* Drop zone */}
        <div
          className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[260px] ${
            dragging
              ? 'bg-[#DBE3E9] border-[#6AA6DA]'
              : 'bg-[#F5F7FA] border-[#EEF2F5] hover:border-[#6AA6DA]/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input id="file-input" type="file" accept=".log,.txt" className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />

          <div className="w-16 h-16 rounded-2xl bg-[#6AA6DA] flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-[#FBFBF8]" strokeWidth={1.8} />
          </div>

          {selectedFile ? (
            <div className="text-center">
              <p className="text-base font-semibold text-[#000000]">{selectedFile.name}</p>
              <p className="text-sm text-[#7A92A8] mt-1">{(selectedFile.size / 1024).toFixed(1)} KB · Click to choose a different file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-base font-semibold text-[#000000]">Drop a log file here</p>
              <p className="text-sm text-[#7A92A8] mt-1">or click to browse · .log or .txt · max 10 MB</p>
            </div>
          )}
        </div>

        {/* Analyze button */}
        {selectedFile && phase === 'idle' && (
          <div className="flex justify-end">
            <button onClick={() => runUpload(selectedFile)}
              className="flex items-center gap-2 px-6 py-3 bg-[#6AA6DA] text-[#FBFBF8] text-sm font-semibold rounded-xl hover:bg-[#5A96CA] transition-colors">
              Analyze Log File <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="bg-[#F5F7FA] rounded-2xl p-5 flex items-start gap-3 border border-[#EEF2F5]">
            <AlertCircle className="w-5 h-5 text-[#000000] shrink-0 mt-0.5" strokeWidth={1.8} />
            <div>
              <p className="text-sm font-bold text-[#000000]">Upload failed</p>
              <p className="text-sm text-[#3D5166] mt-0.5">{errorMsg}</p>
              <button onClick={reset} className="text-sm text-[#6AA6DA] underline mt-2">Try again</button>
            </div>
          </div>
        )}

        {/* Success */}
        {phase === 'done' && result && (
          <div className="bg-[#E1E5AC] rounded-2xl p-6">
            <p className="text-sm font-bold text-[#000000]">Analysis complete</p>
            <p className="text-sm text-[#3D5166] mt-1 leading-relaxed">
              Parsed <strong>{result.parsed_events_count}</strong> events from{' '}
              <strong>{result.total_lines}</strong> lines and created{' '}
              <strong>{result.incidents_created}</strong> incident{result.incidents_created !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate('/incidents')}
                className="flex items-center gap-2 px-4 py-2 bg-[#000000] text-[#FBFBF8] text-sm font-semibold rounded-xl hover:bg-[#111111] transition-colors">
                View Incidents <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <button onClick={reset}
                className="px-4 py-2 bg-white text-[#000000] text-sm font-semibold rounded-xl hover:bg-[#F5F7FA] border border-[#EEF2F5] transition-colors">
                Upload Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: progress + tips ────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Analysis progress */}
        <div className="bg-[#F5F7FA] rounded-2xl p-6 flex-1">
          <h2 className="text-sm font-bold text-[#000000] mb-5">Analysis Progress</h2>
          <ol className="space-y-3">
            {STEPS.map((step, i) => {
              const done   = (phase === 'uploading' && i < currentStep) || phase === 'done';
              const active = phase === 'uploading' && i === currentStep;
              return (
                <li key={step} className="flex items-center gap-3">
                  {done   ? <CheckCircle2 className="w-4 h-4 text-[#6AA6DA] shrink-0" strokeWidth={2.5} />
                  : active ? <Loader2 className="w-4 h-4 text-[#6AA6DA] animate-spin shrink-0" strokeWidth={2} />
                           : <Circle className="w-4 h-4 text-[#EEF2F5] shrink-0" strokeWidth={1.5} />}
                  <span className={`text-sm ${
                    done   ? 'text-[#6AA6DA] font-semibold' :
                    active ? 'text-[#000000] font-semibold' :
                             'text-[#7A92A8]'
                  }`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Tips card */}
        <div className="bg-[#000000] rounded-2xl p-6">
          <p className="text-xs font-bold text-[#FBFBF8]/50 uppercase tracking-widest mb-4">What we detect</p>
          <div className="space-y-3">
            {TIPS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#6AA6DA] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3 h-3 text-[#FBFBF8]" strokeWidth={2} />
                </div>
                <p className="text-xs text-[#FBFBF8]/70 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
