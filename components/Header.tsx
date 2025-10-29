import React, { useState, useRef, useEffect } from 'react';
import { ALL_TIMECODES, TIMECODE_CONFIG } from '../constants.js';
import { ChevronDownIcon, SunIcon, MoonIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons.jsx';
import { User, TimecodeType } from '../types.js';
import { ProfileModal } from './ProfileModal.jsx';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  disabled = false,
  // FIX: Added default value to onClose to make it optional.
  onClose = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef(null);
  
  const toggleOpen = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      if(!newState && onClose) {
          onClose();
      }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (node.current?.contains(e.target)) {
        return;
      }
      setIsOpen(false);
      if(onClose) onClose();
    };
    if(isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={node}>
      <div onClick={toggleOpen}>{trigger}</div>
      {isOpen && !disabled && (
        <div className={`absolute z-20 mt-2 w-48 rounded-md shadow-lg py-1 bg-light-bg dark:bg-dark-bg-secondary ring-1 ring-black ring-opacity-5 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
};


export const Header = ({ user, updateUser, currentTimecode, onTimecodeChange, onSignOut, theme, setTheme, isInteractive }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const currentConfig = TIMECODE_CONFIG[currentTimecode];
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <>
      <header className="bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text dark:text-dark-text p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border">
        <Dropdown
          align="left"
          trigger={
            <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
              <img src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt="user" className="w-8 h-8 rounded-full" />
              <span>Welcome, {user.name}</span>
              <ChevronDownIcon />
            </button>
          }
        >
          <button onClick={() => setIsProfileModalOpen(true)} className="w-full text-left flex items-center px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
              <UserCircleIcon className="mr-3"/> Profile
          </button>
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
                // Manually close dropdown by simulating a click outside
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
      {isProfileModalOpen && <ProfileModal user={user} updateUser={updateUser} onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
};