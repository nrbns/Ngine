export type CheckInStatus = 'done' | 'partial' | 'not-done';

export type ResolutionStatus = 'on-track' | 'off-track';

export interface CheckIn {
  date: string; // YYYY-MM-DD format
  status: CheckInStatus;
  energy: number; // 1-5
}

export interface Resolution {
  id: string;
  name: string;
  mdd: number; // Minimum Daily Discipline (days per week)
  createdAt: string;
  checkIns: CheckIn[];
}

export interface AppData {
  resolution: Resolution | null;
}

