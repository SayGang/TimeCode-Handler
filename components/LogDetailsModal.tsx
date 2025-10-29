import React, { useState, useEffect } from 'react';
import { TimeLog } from '../types.js';
import { formatDuration } from '../utils/time.js';
import { api } from '../utils/api.js';

export const LogDetailsModal = ({ log, onClose, onUpdate, isEditable }) => {
    const [details, setDetails] = useState(log.details || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setDetails(log.details || '');
    }, [log]);

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedLog = await api.updateLogDetails(log.id, details);
            onUpdate(updatedLog);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save details.");
        } finally {
            setIsLoading(false);
        }
    };

    const duration = log.endTime ? (log.endTime.getTime() - log.startTime.getTime()) / 1000 : (new Date().getTime() - log.startTime.getTime()) / 1000;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" onClick={onClose}>
            <div className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Log Details</h2>

                <div className="space-y-4">
                    <div>
                        <span className="font-semibold">Timecode:</span> {log.code}
                    </div>
                    <div>
                        <span className="font-semibold">Start Time:</span> {log.startTime.toLocaleString()}
                    </div>
                    <div>
                        <span className="font-semibold">End Time:</span> {log.endTime ? log.endTime.toLocaleString() : 'In Progress'}
                    </div>
                     <div>
                        <span className="font-semibold">Duration:</span> {formatDuration(duration)}
                    </div>
                    <div>
                        <label htmlFor="log-details" className="block font-semibold mb-1">Details / Notes:</label>
                        <textarea
                            id="log-details"
                            rows={4}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            readOnly={!isEditable}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-light-bg-tertiary dark:bg-dark-bg-tertiary focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={isEditable ? "Add details about this time entry..." : "No details provided."}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                        Close
                    </button>
                    {isEditable && (
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {isLoading ? 'Saving...' : 'Save Details'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
