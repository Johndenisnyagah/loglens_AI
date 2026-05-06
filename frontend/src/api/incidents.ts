import { api } from './client';
import type { Incident, IncidentDetail, IncidentStatus } from '../types';

export interface IncidentFilters {
  severity?: string;
  status?: string;
  search?: string;
}

export async function getIncidents(filters?: IncidentFilters): Promise<Incident[]> {
  const { data } = await api.get<Incident[]>('/api/incidents', { params: filters });
  return data;
}

export async function getIncident(id: number): Promise<IncidentDetail> {
  const { data } = await api.get<IncidentDetail>(`/api/incidents/${id}`);
  return data;
}

export async function updateIncidentStatus(
  id: number,
  status: IncidentStatus,
): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/api/incidents/${id}/status`, { status });
  return data;
}
