import { TimecodeEnum } from './types.js';

export const TIMECODE_CONFIG = {
  [TimecodeEnum.Production]: { name: TimecodeEnum.Production, color: 'bg-production' },
  [TimecodeEnum.Session]: { name: TimecodeEnum.Session, color: 'bg-session' },
  [TimecodeEnum.Lunch]: { name: TimecodeEnum.Lunch, color: 'bg-lunch' },
  [TimecodeEnum.Break]: { name: TimecodeEnum.Break, color: 'bg-break' },
  [TimecodeEnum.Unavailable]: { name: TimecodeEnum.Unavailable, color: 'bg-unavailable' },
};

export const ALL_TIMECODES = Object.values(TimecodeEnum);
