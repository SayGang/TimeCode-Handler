import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Role, TimecodeEnum, User } from '../types.js';
import { Header } from './Header.jsx';
import { DayView } from './DayView.jsx';
import { WeekView } from './WeekView.jsx';
import { AdminView } from './AdminView.jsx';
import { calculateTotals, parseLogDates } from '../utils/time.js';
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx';
import { api } from '../utils/api.js';
import { LogDetailsModal } from './LogDetailsModal.jsx';

export const Portal = ({ user, updateUser, onSignOut, theme, setTheme }) => {
  const [viewMode, setViewMode] = useState('day');
  const [selectedAgent, setSelectedAgent] = useState(user.role === Role.Admin ? null : user);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [userLogs, setUserLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);


  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const effectiveUser = selectedAgent || user;

  const fetchLogs = useCallback(async (userId) => {
    try {
      setIsLoadingLogs(true);
      setErrorLogs(null);
      const logs = await api.getUserLogs(userId);
      setUserLogs(logs.map(parseLogDates).sort((a,b) => a.startTime - b.startTime));
    } catch (err) {
      setErrorLogs(err.message || 'Failed to fetch time logs.');
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (effectiveUser) {
      fetchLogs(effectiveUser.id);
    } else {
      setUserLogs([]); // Clear logs when in admin root view
    }
  }, [effectiveUser, fetchLogs]);
  
  const currentTimecode = useMemo(() => {
    if (userLogs.length > 0) {
      const lastLog = userLogs[userLogs.length - 1];
      if (lastLog.endTime === null) return lastLog.code;
    }
    return TimecodeEnum.Unavailable;
  }, [userLogs]);

  const changeTimecode = useCallback(async (newCode) => {
    if (!effectiveUser || user.id !== effectiveUser.id) return;
    
    const lastLog = userLogs.length > 0 ? userLogs[userLogs.length - 1] : null;
    if (lastLog && lastLog.code === newCode && lastLog.endTime === null) {
        return; 
    }
    
    try {
        await api.changeTimecode(newCode);
        await fetchLogs(user.id); // Refetch logs to get server-updated data
    } catch(err) {
        console.error("Failed to change timecode", err);
        // Optionally show an error to the user
    }
  }, [effectiveUser, user.id, userLogs, fetchLogs]);
  
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
    setDisplayDate(new Date()); 
    setViewMode('day');
  }
  
  const handleBackToAdmin = () => {
    setSelectedAgent(null);
  }

  const handleLogUpdate = (updatedLog) => {
    setUserLogs(prevLogs => prevLogs.map(log => log.id === updatedLog.id ? parseLogDates(updatedLog) : log));
  };
  
  const isOwnView = user.id === effectiveUser?.id;

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Header user={user} updateUser={updateUser} currentTimecode={currentTimecode} onTimecodeChange={changeTimecode} onSignOut={onSignOut} theme={theme} setTheme={setTheme} isInteractive={isOwnView} />
      
      <main className="flex-grow">
        {user.role === Role.Admin && !selectedAgent ? (
          <AdminView onAgentClick={handleAgentClick} />
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
            {isLoadingLogs && <div className="p-6">Loading logs...</div>}
            {errorLogs && <div className="p-6 text-red-500">{errorLogs}</div>}
            {!isLoadingLogs && !errorLogs && viewMode === 'day' && <DayView logs={userLogs} totals={totals} now={now} onLogClick={setSelectedLog} />}
            {!isLoadingLogs && !errorLogs && viewMode === 'week' && <WeekView startDate={displayDate} onDayClick={handleDayClick} allLogsForUser={userLogs} />}
          </>
        )}
      </main>
      {selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} onUpdate={handleLogUpdate} isEditable={isOwnView} />}
    </div>
  );
};
