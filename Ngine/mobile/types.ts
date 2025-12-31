// Type definitions
export interface Resolution {
  id: string;
  user_id: string;
  title: string;
  why?: string;
  duration: number;
  mdd: string;
  support: 'strict' | 'logical' | 'gentle';
  status: 'aligned' | 'drifting' | 'broken' | 'recovering';
  created_at: string;
  success_probability?: number;
}

