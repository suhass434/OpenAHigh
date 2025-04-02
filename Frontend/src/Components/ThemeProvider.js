import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  
  useEffect(() => {
   
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.style.backgroundColor = '#111827'; 
      document.documentElement.style.color = '#f9fafb'; 
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.style.backgroundColor = '#f9fafb'; 
      document.documentElement.style.color = '#111827'; 
    }
  }, [isDarkMode]);

  return <>{children}</>;
};

export default ThemeProvider;