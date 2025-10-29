export const Role = {
  Admin: 'admin',
  Agent: 'agent',
} as const;

export const TimecodeEnum = {
  Production: 'Production',
  Session: 'Session',
  Lunch: 'Lunch',
  Break: 'Break',
  Unavailable: 'Unavailable'
} as const;

type ObjectValues<T> = T[keyof T];
export type RoleType = ObjectValues<typeof Role>;
export type TimecodeType = ObjectValues<typeof TimecodeEnum>;

export interface User {
  id: number;
  role: RoleType;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export interface TimeLog {
  id: number;
  userId: number;
  code: TimecodeType;
  startTime: Date;
  endTime: Date | null;
  details?: string;
}
