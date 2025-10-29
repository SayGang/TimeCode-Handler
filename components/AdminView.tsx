import React, { useState, useEffect, useMemo } from 'react';
import { agents as allAgents } from '../data/users.js';
import { TIMECODE_CONFIG } from '../constants.js';
import { formatDuration } from '../utils/time.js';
import { TimecodeEnum } from '../types.js';

const AgentTimeline = ({ logs, now }) => {
  const totalDaySeconds = 24 * 60 * 60;
  
  return (
    <div className="relative h-6 w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded">
      {logs.map((log, index) => {
        const startOfDay = new Date(log.startTime);
        startOfDay.setHours(0, 0, 0, 0);

        const startTimeSeconds = (log.startTime.getTime() - startOfDay.getTime()) / 1000;
        const endTime = log.endTime ?? now;
        
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
            key={index}
            className={`absolute h-full ${config.color} transition-all duration-300 ease-in-out`}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${log.code}: ${formatDuration(durationSeconds)}`}
          ></div>
        );
      })}
    </div>
  );
};


export const AdminView = ({ onAgentClick, allTimeLogs }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, [now]); // update once a day is fine, but now is simpler

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Agent Overview</h2>
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-md divide-y divide-light-border dark:divide-dark-border">
        {allAgents.map(agent => {
          const allLogs = allTimeLogs[agent.id] || [];
          
          const todayLogs = allLogs.filter(log => new Date(log.startTime) >= today);

          const currentLog = allLogs.length > 0 ? allLogs[allLogs.length-1] : null;
          const currentStatus = currentLog ? currentLog.code : TimecodeEnum.Unavailable;
          const config = TIMECODE_CONFIG[currentStatus];

          return (
            <button key={agent.id} onClick={() => onAgentClick(agent)} className="w-full text-left p-4 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4">
                <div className="flex items-center space-x-3">
                    <img src={`https://picsum.photos/seed/${agent.id}/40/40`} alt={agent.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <div className="font-bold">{agent.name}</div>
                        <div className={`text-sm font-semibold ${config.color.replace('bg-', 'text-')}`}>{currentStatus}</div>
                    </div>
                </div>
                <AgentTimeline logs={todayLogs} now={now} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
