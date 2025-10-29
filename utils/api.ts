import { TimecodeType } from "../types";

const API_BASE_URL = '/api'; // In a real app, this would be an environment variable

let logoutHandler = () => {
    console.error("Logout handler not set");
};

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const getAuthToken = () => localStorage.getItem('authToken');

// FIX: Typed the options parameter as 'any' to prevent incorrect type inference on the default empty object.
const apiFetch = async (url, options: any = {}) => {
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };
    
    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

        if (response.status === 401) {
            logoutHandler();
            throw new Error('Your session has expired. Please log in again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || 'An unknown API error occurred');
        }

        return response.json();
    } catch (err) {
        console.error(`API call to ${url} failed:`, err);
        throw err; // Re-throw the error to be caught by the calling function
    }
};

export const api = {
    login: (email, password) => {
        return apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },
    getMe: () => {
        return apiFetch('/auth/me');
    },
    getAllAgents: () => {
        return apiFetch('/users/agents');
    },
    getAllLogs: () => {
        return apiFetch('/logs/all');
    },
    getUserLogs: (userId) => {
        return apiFetch(`/logs/user/${userId}`);
    },
    changeTimecode: (code: TimecodeType) => {
        return apiFetch('/logs/timecode', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },
    updateLogDetails: (logId, details) => {
        return apiFetch(`/logs/${logId}`, {
            method: 'PATCH',
            body: JSON.stringify({ details }),
        });
    },
    uploadProfilePicture: (formData) => {
        return apiFetch('/users/profile-picture', {
            method: 'POST',
            body: formData, // FormData will be passed in directly
        });
    }
};