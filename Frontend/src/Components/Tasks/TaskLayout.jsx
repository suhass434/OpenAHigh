import React from 'react';
import { useSelector } from 'react-redux';

const TaskLayout = ({ title, description, children }) => {
  const isDarkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`container mx-auto p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Instructions
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>

      {/* Input/Output Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Input
          </h2>
          <div className="input-container">
            {children?.input}
          </div>
        </div>

        {/* Output Section */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Output
          </h2>
          <div className="output-container">
            {children?.output}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskLayout; 