import React from 'react';
import { TimecodeEnum } from '../types.js';
import { TIMECODE_CONFIG } from '../constants.js';
import { formatDuration, calculateTotals } from '../utils/time.js';

export const WeekView = ({ startDate, onDayClick, allLogsForUser }) => {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    return date;
  });

  const weeklyTotals = {
    [TimecodeEnum.Production]: 0,
    [TimecodeEnum.Session]: 0,
    [TimecodeEnum.Lunch]: 0,
    [TimecodeEnum.Break]: 0,
    [TimecodeEnum.Unavailable]: 0,
  };

  const dayData = weekDates.map(date => {
    const dailyTotals = calculateTotals(allLogsForUser, date, new Date());
    
    Object.keys(dailyTotals).forEach(key => {
        weeklyTotals[key] += dailyTotals[key];
    });

    return { date, totals: dailyTotals };
  });

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-md divide-y divide-light-border dark:divide-dark-border">
        {dayData.map(({ date, totals }) => (
          <button 
            key={date.toISOString()} 
            onClick={() => onDayClick(date)}
            className="w-full text-left p-4 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="font-bold text-lg mb-2 md:mb-0">
                {date.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-1 text-sm">
                {Object.entries(totals).map(([code, totalSeconds]) => (
                  <div key={code}>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">{code}: </span>
                    <span className="font-semibold">{formatDuration(totalSeconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
        {Object.entries(weeklyTotals).map(([code, totalSeconds]) => {
          const config = TIMECODE_CONFIG[code];
          return (
            <div key={code} className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-3 rounded-lg shadow">
              <div className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary">{code} Total</div>
              <div className={`text-xl font-bold ${config.color.replace('bg-', 'text-')}`}>{formatDuration(totalSeconds)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
