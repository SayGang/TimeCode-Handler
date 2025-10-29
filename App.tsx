import React, { useState, useEffect } from 'react';
import { Login } from './components/Login.jsx';
import { Portal } from './components/Portal.jsx';
import { users } from './data/users.js';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [allTimeLogs, setAllTimeLogs] = useState({});

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const handleLogin = (email, pass) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      setError(null);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  return (
    <div className={`font-sans ${theme}`}>
      {currentUser ? (
        <Portal 
          user={currentUser} 
          onSignOut={handleSignOut} 
          theme={theme} 
          setTheme={setTheme} 
          allTimeLogs={allTimeLogs}
          setAllTimeLogs={setAllTimeLogs}
        />
      ) : (
        <Login onLogin={handleLogin} error={error} />
      )}
    </div>
  );
}

export default App;
