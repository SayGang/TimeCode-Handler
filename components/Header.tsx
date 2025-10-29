import React, { useState, useRef, useEffect } from 'react';
import { ALL_TIMECODES, TIMECODE_CONFIG } from '../constants.js';
import { ChevronDownIcon, SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons.jsx';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (node.current?.contains(e.target)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={node}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && !disabled && (
        <div className={`absolute z-20 mt-2 w-48 rounded-md shadow-lg py-1 bg-light-bg dark:bg-dark-bg-secondary ring-1 ring-black ring-opacity-5 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
};


export const Header = ({ user, currentTimecode, onTimecodeChange, onSignOut, theme, setTheme, isInteractive }) => {
  const currentConfig = TIMECODE_CONFIG[currentTimecode];
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <header className="bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-dark-text p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
      <Dropdown
        align="left"
        trigger={
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
            <img src={`https://picsum.photos/seed/${user.id}/40/40`} alt="user" className="w-8 h-8 rounded-full" />
            <span>Welcome, {user.name}</span>
            <ChevronDownIcon />
          </button>
        }
      >
        <a href="#" className="flex items-center px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
            <UserCircleIcon className="mr-3"/> Profile
        </a>
        <button onClick={toggleTheme} className="w-full text-left flex items-center px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
            {theme === 'light' ? <MoonIcon className="mr-3" /> : <SunIcon className="mr-3"/>}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button onClick={onSignOut} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
            <ArrowRightOnRectangleIcon className="mr-3"/> Sign Out
        </button>
      </Dropdown>
      
      <Dropdown
        disabled={!isInteractive}
        trigger={
          <button disabled={!isInteractive} className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold text-white ${currentConfig.color} transition-opacity ${isInteractive ? 'hover:opacity-90' : 'cursor-not-allowed opacity-70'}`}>
            <span>{currentTimecode}</span>
            <ChevronDownIcon />
          </button>
        }
      >
        {ALL_TIMECODES.map(code => (
          <a
            key={code}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTimecodeChange(code);
              // Manually close dropdown
              // Fix: Use a type guard to ensure dropdownTrigger is an HTMLElement before calling .click()
              const dropdownTrigger = e.currentTarget.closest('.relative')?.firstChild;
              if (dropdownTrigger instanceof HTMLElement) {
                dropdownTrigger.click();
              }
            }}
            className="block px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
          >
            {code}
          </a>
        ))}
      </Dropdown>
    </header>
  );
};