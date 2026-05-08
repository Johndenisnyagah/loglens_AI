import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle2, Circle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { uploadLogFile } from '../api/logs';
import type { UploadResult } from '../types';
import { PageHeader } from '../components/layout/PageHeader';

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
      setCurrentStep(STEPS.length - 1);
      setResult(data);
      setPhase('done');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Upload failed. Please check the backend is running.';
      setErrorMsg(msg); setPhase('error'); setCurrentStep(-1);
    }
  }

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  function reset() {
    setPhase('idle'); setCurrentStep(-1); setResult(null); setErrorMsg(''); setSelectedFile(null);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Upload Logs" subtitle="Analyze a Linux authentication log file" />

      {/* Drop zone */}
      <div
        className={`rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer border-2 border-dashed ${
          dragging
            ? 'bg-[#EDE9FE] border-[#7C3AED]'
            : 'bg-[#F7F6F4] border-[#EDECE8] hover:border-[#7C3AED]/40'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input id="file-input" type="file" accept=".log,.txt" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />

        <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-[#7C3AED]" strokeWidth={1.8} />
        </div>

        {selectedFile ? (
          <>
            <p className="text-sm font-semibold text-[#111827]">{selectedFile.name}</p>
            <p className="text-xs text-[#6B7280] mt-1">{(selectedFile.size / 1024).toFixed(1)} KB · Click to choose a different file</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#111827]">Drop a log file here</p>
            <p className="text-xs text-[#6B7280] mt-1">or click to browse · .log or .txt · max 10 MB</p>
          </>
        )}
      </div>

      {selectedFile && phase === 'idle' && (
        <div className="mt-4 flex justify-end">
          <button onClick={() => runUpload(selectedFile)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors">
            Analyze Log File <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Progress */}
      {(phase === 'uploading' || phase === 'done') && (
        <div className="mt-6 bg-[#F7F6F4] border border-[#EDECE8] rounded-2xl p-7">
          <h2 className="text-sm font-semibold text-[#111827] mb-6">Analysis Progress</h2>
          <ol className="space-y-3.5">
            {STEPS.map((step, i) => {
              const done   = i < currentStep || phase === 'done';
              const active = i === currentStep && phase === 'uploading';
              return (
                <li key={step} className="flex items-center gap-3">
                  {done   ? <CheckCircle2 className="w-5 h-5 text-[#7C3AED] shrink-0" strokeWidth={2.5} />
                  : active ? <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin shrink-0" strokeWidth={2} />
                           : <Circle className="w-5 h-5 text-[#EDECE8] shrink-0" strokeWidth={1.5} />}
                  <span className={`text-sm ${done ? 'text-[#7C3AED] font-semibold' : active ? 'text-[#111827] font-semibold' : 'text-[#C4B8A8]'}`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="mt-6 bg-[#FEF2F2] border border-[#FECACA]/50 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" strokeWidth={1.8} />
          <div>
            <p className="text-sm font-semibold text-[#991B1B]">Upload failed</p>
            <p className="text-sm text-[#DC2626] mt-0.5">{errorMsg}</p>
            <button onClick={reset} className="text-sm text-[#991B1B] underline mt-2">Try again</button>
          </div>
        </div>
      )}

      {/* Success */}
      {phase === 'done' && result && (
        <div className="mt-6 bg-[#EDE9FE] border border-[#DDD6FE]/50 rounded-2xl p-6">
          <p className="text-sm font-bold text-[#5B21B6]">Analysis complete</p>
          <p className="text-sm text-[#7C3AED] mt-1 leading-relaxed">
            Parsed <strong>{result.parsed_events_count}</strong> events from{' '}
            <strong>{result.total_lines}</strong> lines and created{' '}
            <strong>{result.incidents_created}</strong> incident{result.incidents_created !== 1 ? 's' : ''}.
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => navigate('/incidents')}
              className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors">
              View Incidents <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            <button onClick={reset}
              className="px-4 py-2 bg-white text-[#7C3AED] text-sm font-semibold rounded-xl hover:bg-[#F5F3FF] transition-colors border border-[#DDD6FE]/50">
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
