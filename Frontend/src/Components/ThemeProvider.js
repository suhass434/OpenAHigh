import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  
  useEffect(() => {
   
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.style.backgroundColor = '#111827'; // bg-gray-900
      document.documentElement.style.color = '#f9fafb'; // text-gray-50
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.style.backgroundColor = '#f9fafb'; // bg-gray-50
      document.documentElement.style.color = '#111827'; // text-gray-900
    }
  }, [isDarkMode]);

  return <>{children}</>;
};

export default ThemeProvider;