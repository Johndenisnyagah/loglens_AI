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

  onProgress?.(1);

  const { data } = await api.post<UploadResult>('/api/logs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  onProgress?.(8);
  return data;
}
