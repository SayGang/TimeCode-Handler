import React, { useState, useEffect } from 'react';
import { Login } from './components/Login.jsx';
import { Portal } from './components/Portal.jsx';
import { api, setLogoutHandler } from './utils/api.js';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  useEffect(() => {
    // Pass the sign out handler to the api module to handle 401s
    setLogoutHandler(handleSignOut);

    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
        } catch (err) {
          console.error('Session check failed:', err);
          handleSignOut();
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const handleLogin = async (email, pass) => {
    try {
      const { token, user } = await api.login(email, pass);
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setError(null);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    }
  };
  
  const updateUser = (updatedUser) => {
    setCurrentUser(prev => ({...prev, ...updatedUser}));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        Loading application...
      </div>
    )
  }

  return (
    <div className={`font-sans ${theme}`}>
      {currentUser ? (
        <Portal 
          user={currentUser} 
          updateUser={updateUser}
          onSignOut={handleSignOut} 
          theme={theme} 
          setTheme={setTheme} 
        />
      ) : (
        <Login onLogin={handleLogin} error={error} />
      )}
    </div>
  );
}

export default App;
