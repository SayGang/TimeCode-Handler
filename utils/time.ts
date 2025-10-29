import { TimecodeEnum, TimeLog } from '../types.js';

export const parseLogDates = (log) => ({
  ...log,
  startTime: new Date(log.startTime),
  endTime: log.endTime ? new Date(log.endTime) : null,
});

export const formatDuration = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

export const calculateTotals = (logs: TimeLog[], targetDate, now) => {
  const totals = {
    [TimecodeEnum.Production]: 0,
    [TimecodeEnum.Session]: 0,
    [TimecodeEnum.Lunch]: 0,
    [TimecodeEnum.Break]: 0,
    [TimecodeEnum.Unavailable]: 0,
  };

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  logs.forEach(log => {
    const logStart = log.startTime;
    const logEnd = log.endTime ?? now;

    // Clamp start and end times to the target day
    const effectiveStart = Math.max(logStart.getTime(), startOfDay.getTime());
    const effectiveEnd = Math.min(logEnd.getTime(), endOfDay.getTime());
    
    if (effectiveEnd > effectiveStart) {
      const durationSeconds = (effectiveEnd - effectiveStart) / 1000;
      totals[log.code] += durationSeconds;
    }
  });

  return totals;
};
