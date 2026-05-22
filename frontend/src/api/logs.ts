import { api } from './client';
import type { LogFile, UploadResult } from '../types';

export async function getLogs(): Promise<LogFile[]> {
  const { data } = await api.get<LogFile[]>('/api/logs');
  return data;
}

export async function uploadLogFile(
  file: File,
  onProgress?: (step: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const model = (() => {
    try { return JSON.parse(localStorage.getItem('ll-ai-model') ?? '"gpt-4o-mini"'); } catch { return 'gpt-4o-mini'; }
  })();
  const autoSummary = (() => {
    try { return JSON.parse(localStorage.getItem('ll-auto-summary') ?? 'true'); } catch { return true; }
  })();

  onProgress?.(1);

  const { data } = await api.post<UploadResult>(
    `/api/logs/upload?model=${encodeURIComponent(model)}&auto_summary=${autoSummary}`,
    formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  onProgress?.(8);
  return data;
}
