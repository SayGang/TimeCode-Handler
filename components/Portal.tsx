import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Role, TimecodeEnum } from '../types.js';
import { Header } from './Header.jsx';
import { DayView } from './DayView.jsx';
import { WeekView } from './WeekView.jsx';
import { AdminView } from './AdminView.jsx';
import { calculateTotals } from '../utils/time.js';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx';

export const Portal = ({ user, onSignOut, theme, setTheme, allTimeLogs, setAllTimeLogs }) => {
  const [viewMode, setViewMode] = useState('day');
  const [selectedAgent, setSelectedAgent] = useState(user.role === Role.Admin ? null : user);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const effectiveUser = selectedAgent || user;
  const userLogs = useMemo(() => allTimeLogs[effectiveUser.id] || [], [allTimeLogs, effectiveUser.id]);

  // Create initial log for the current logged-in user if they have no logs.
  useEffect(() => {
      if(user && user.id === effectiveUser.id && userLogs.length === 0) {
          const newLog = {
              userId: user.id,
              code: TimecodeEnum.Unavailable,
              startTime: new Date(),
              endTime: null,
          };
          setAllTimeLogs(prev => ({ ...prev, [user.id]: [newLog] }));
      }
  }, [user, effectiveUser.id, userLogs.length, setAllTimeLogs]);
  
  const currentTimecode = useMemo(() => {
    if (userLogs.length > 0) {
      const lastLog = userLogs[userLogs.length - 1];
      if (lastLog.endTime === null) return lastLog.code;
    }
    // If last log is finished, or no logs, they are unavailable
    return TimecodeEnum.Unavailable;
  }, [userLogs]);

  const changeTimecode = useCallback((newCode) => {
    if (!effectiveUser || user.id !== effectiveUser.id) return;
    
    const now = new Date();
    const currentLogs = [...(allTimeLogs[effectiveUser.id] || [])];
    
    const lastLog = currentLogs.length > 0 ? currentLogs[currentLogs.length - 1] : null;
    if (lastLog && lastLog.code === newCode && lastLog.endTime === null) {
        return; // Avoid creating duplicate entries
    }
    
    if (lastLog && lastLog.endTime === null) {
      lastLog.endTime = now;
    }

    currentLogs.push({
      userId: effectiveUser.id,
      code: newCode,
      startTime: now,
      endTime: null,
    });
    
    setAllTimeLogs(prev => ({ ...prev, [effectiveUser.id]: currentLogs }));
  }, [effectiveUser, user.id, allTimeLogs, setAllTimeLogs]);
  
  const totals = useMemo(() => calculateTotals(userLogs, displayDate, now), [userLogs, displayDate, now]);
  
  const handleDateChange = (increment) => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      if(viewMode === 'day') {
        newDate.setDate(newDate.getDate() + increment);
      } else {
        newDate.setDate(newDate.getDate() + (increment * 7));
      }
      return newDate;
    });
  };

  const handleDayClick = (date) => {
    setDisplayDate(date);
    setViewMode('day');
  }
  
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setDisplayDate(new Date()); // Reset date when switching agent
    setViewMode('day'); // Switch to day view for the selected agent
  }
  
  const handleBackToAdmin = () => {
    setSelectedAgent(null);
  }
  
  const isOwnView = user.id === effectiveUser.id;

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Header user={user} currentTimecode={currentTimecode} onTimecodeChange={changeTimecode} onSignOut={onSignOut} theme={theme} setTheme={setTheme} isInteractive={isOwnView} />
      
      <main className="flex-grow">
        {user.role === Role.Admin && !selectedAgent ? (
          <AdminView onAgentClick={handleAgentClick} allTimeLogs={allTimeLogs} />
        ) : (
          <>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-light-border dark:border-dark-border flex-wrap">
                <div className="flex items-center gap-4">
                    {user.role === Role.Admin && selectedAgent && (
                        <button onClick={handleBackToAdmin} className="text-sm font-semibold hover:underline flex items-center gap-1 whitespace-nowrap">
                            <ChevronLeftIcon className="w-4 h-4" /> Back to Admin View
                        </button>
                    )}
                    { selectedAgent && selectedAgent.id !== user.id && (
                        <div className="font-bold text-lg whitespace-nowrap">Viewing: {selectedAgent.name}</div>
                    ) }
                </div>

              <div className="flex items-center space-x-4 bg-light-bg-secondary dark:bg-dark-bg-secondary p-1 rounded-lg">
                <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${viewMode === 'day' ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary shadow' : 'opacity-70'}`}>Day View</button>
                <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${viewMode === 'week' ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary shadow' : 'opacity-70'}`}>Last 7 days</button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-center">{displayDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <div className="flex items-center">
                  <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"><ChevronLeftIcon /></button>
                  <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary"><ChevronRightIcon /></button>
                </div>
              </div>
            </div>
            {viewMode === 'day' && <DayView logs={userLogs} totals={totals} now={now} />}
            {viewMode === 'week' && <WeekView startDate={displayDate} onDayClick={handleDayClick} allLogsForUser={userLogs} />}
          </>
        )}
      </main>
    </div>
  );
};
