import React from 'react';
import { TimecodeEnum } from '../types.js';
import { TIMECODE_CONFIG } from '../constants.js';
import { formatDuration } from '../utils/time.js';

const TimelineBar = ({ log, now }) => {
    const startOfDay = new Date(log.startTime);
    startOfDay.setHours(0, 0, 0, 0);
    const totalDaySeconds = 24 * 60 * 60;

    const startTimeSeconds = (log.startTime.getTime() - startOfDay.getTime()) / 1000;
    const endTime = log.endTime ?? now;

    // Clamp end time to the end of the current day to prevent overflow
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
    const clampedEndTime = Math.min(endTime.getTime(), endOfDay.getTime());

    const endTimeSeconds = (clampedEndTime - startOfDay.getTime()) / 1000;
    
    const durationSeconds = Math.max(0, endTimeSeconds - startTimeSeconds);

    const left = (startTimeSeconds / totalDaySeconds) * 100;
    const width = (durationSeconds / totalDaySeconds) * 100;
    const config = TIMECODE_CONFIG[log.code];

    if (width <= 0) return null;

    return (
        <div
            className={`absolute h-full ${config.color} rounded transition-all duration-300 ease-in-out`}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${log.code}: ${formatDuration(durationSeconds)}`}
        ></div>
    );
};

export const DayView = ({ logs, totals, now }) => {
  const hours = Array.from({ length: 5 }, (_, i) => i * 6);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg shadow-md">
        <div className="relative mb-2">
          <div className="grid grid-cols-5 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {hours.map(h => <div key={h}>{h.toString().padStart(2, '0')}:00</div>)}
          </div>
          <div className="relative h-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full mt-2">
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-4">
                <div className="border-r border-light-border dark:border-dark-border ml-[25%]"></div>
                <div className="border-r border-light-border dark:border-dark-border ml-[50%]"></div>
                <div className="border-r border-light-border dark:border-dark-border ml-[75%]"></div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {Object.values(TimecodeEnum).map(code => {
            const codeLogs = logs.filter(log => log.code === code);
            return (
              <div key={code} className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="font-semibold text-sm truncate">{code}</span>
                <div className="relative h-6 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded">
                    {codeLogs.map((log, index) => (
                        <TimelineBar key={index} log={log} now={now} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
          {Object.entries(totals).map(([code, totalSeconds]) => {
              const config = TIMECODE_CONFIG[code];
              return (
                  <div key={code} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-3 rounded-lg shadow">
                      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{code}</div>
                      <div className={`text-xl font-bold ${config.color.replace('bg-', 'text-')}`}>{formatDuration(totalSeconds)}</div>
                  </div>
              )
          })}
      </div>
    </div>
  );
};
