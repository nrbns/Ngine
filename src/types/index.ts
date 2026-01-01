// Type definitions for NGINE

export type CheckInStatus = 'yes' | 'partial' | 'no';

export type ResolutionStatus = 'aligned' | 'drifting' | 'broken' | 'recovering';

export type SupportStyle = 'strict' | 'logical' | 'gentle';

export interface CheckIn {
  id: string;
  resolution_id: string;
  date: string;
  execution: CheckInStatus;
  blocker?: string;
  energy: number;
  created_at: string;
}

export interface Resolution {
  id: string;
  user_id: string;
  title: string;
  why?: string;
  duration_days: number;
  mdd_text: string;
  mdd_value: number;
  support_style: SupportStyle;
  status: ResolutionStatus;
  start_date: string;
  end_date: string;
  recovery_start_date?: string;
  recovery_end_date?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  success_probability?: number;
  days_remaining?: number;
  checkins_count?: number;
}

export interface AIInsight {
  id: string;
  resolution_id: string;
  insight_text: string;
  type: 'drift' | 'failure' | 'summary';
  created_at: string;
}

export interface DashboardData {
  resolutions: Resolution[];
}

