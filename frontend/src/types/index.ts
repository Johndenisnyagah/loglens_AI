export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'reviewed' | 'false_positive' | 'resolved';
export type LogFileStatus = 'uploaded' | 'processing' | 'analyzed' | 'failed';
export type AIConfidence = 'low' | 'medium' | 'high';

export interface LogFile {
  id: number;
  filename: string;
  file_type: string;
  uploaded_at: string;
  status: LogFileStatus;
  total_lines: number;
  parsed_events_count: number;
}

export interface AISummary {
  id: number;
  incident_id: number;
  summary: string;
  why_it_matters: string;
  recommended_actions: string[];
  confidence: AIConfidence;
  model_used: string | null;
  created_at: string;
}

export interface Evidence {
  id: number;
  raw_message: string;
}

export interface Incident {
  id: number;
  log_file_id: number;
  title: string;
  severity: Severity;
  risk_score: number;
  source_ip: string | null;
  username: string | null;
  detection_rule: string;
  description: string;
  status: IncidentStatus;
  needs_human_review: boolean;
  created_at: string;
}

export interface IncidentDetail extends Incident {
  evidence: Evidence[];
  ai_summary: AISummary | null;
}

export interface SuspiciousIP {
  source_ip: string;
  incident_count: number;
  highest_severity: Severity;
}

export interface DashboardSummary {
  total_logs: number;
  total_incidents: number;
  high_risk_incidents: number;
  needs_review_count: number;
  recent_incidents: Incident[];
  top_suspicious_ips: SuspiciousIP[];
  ai_insight: string | null;
}

export interface UploadResult {
  log_file_id: number;
  filename: string;
  total_lines: number;
  parsed_events_count: number;
  incidents_created: number;
  status: string;
}
