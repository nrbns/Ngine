// Type definitions
export interface Resolution {
  id: string;
  user_id: string;
  title: string;
  why?: string;
  duration: number;
  mdd: string;
  mdd_value?: number;
  support: 'strict' | 'logical' | 'gentle';
  status: 'aligned' | 'drifting' | 'broken' | 'recovering';
  start_date?: string;
  end_date?: string;
  created_at: string;
  success_probability?: number;
}

export interface Checkin {
  id?: string;
  resolution_id: string;
  date: string;
  execution?: 'yes' | 'no' | 'partial';
  blocker?: string | null;
  energy?: number;
}

export interface Aim {
  id: string;
  user_id: string;
  title: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
}

export interface GoalProof {
  id: string;
  resolution_id: string;
  user_id: string;
  file_url: string;
  file_type?: 'image' | 'document';
  note?: string | null;
  created_at?: string;
}

export type Nullable<T> = T | null;

