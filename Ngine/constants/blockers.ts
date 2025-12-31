// Common blockers for check-ins
export const BLOCKERS = [
  'Lack of time',
  'Low energy',
  'Lost motivation',
  'Unexpected event',
  'Other',
] as const;

export type Blocker = typeof BLOCKERS[number];

