import { api } from './client';
import type { DashboardSummary } from '../types';

export interface DashboardFilters {
  hours?: number;       // 0 = all time, 24 = last 24h, etc.
  log_file_id?: number; // undefined = all hosts
}

export async function getDashboardSummary(filters?: DashboardFilters): Promise<DashboardSummary> {
  const params: Record<string, string | number> = {};
  if (filters?.hours !== undefined) params.hours = filters.hours;
  if (filters?.log_file_id !== undefined) params.log_file_id = filters.log_file_id;
  const { data } = await api.get<DashboardSummary>('/api/dashboard/summary', { params });
  return data;
}
