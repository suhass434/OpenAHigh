import React from 'react';
import FileUpload from '../FileUpload';
import PDFManager from '../PDFManager';
import { useSelector } from 'react-redux';

const PDFs = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700/70' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Upload New PDFs
        </h3>
        <FileUpload />
      </div>

      <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700/70' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Your PDFs
        </h3>
        <PDFManager />
      </div>
    </div>
  );
};

export default PDFs; 