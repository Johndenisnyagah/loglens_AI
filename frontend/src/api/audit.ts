import { api } from './client';
import type { AuditEntry } from '../types';

export interface AuditFilters {
  action?: string;
  target_type?: string;
  limit?: number;
}

export async function getAuditLog(filters?: AuditFilters): Promise<AuditEntry[]> {
  const { data } = await api.get<AuditEntry[]>('/api/audit', { params: filters });
  return data;
}
