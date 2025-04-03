import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Task2SoftwareCompatibility = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const user = useSelector(state => state.auth.signupData);
  
  // Experion versions for dropdowns
  const [experionVersions] = useState(['R520.1', 'R520.2', 'R530.1']);
  
  // Component types with predefined list
  const componentTypes = [
    'Blending and Movement',
    'Control Performance Monitor',
    'Domain Controller',
    'Dynamo',
    'Dynamo Operations Suite (DOS)',
    'Field Device Manager (FDM)',
    'Operating System',
    'Profit Suite',
    'Server Hardware',
    'Workstation Hardware'
  ];
  
  // State for source and target selection
  const [installedSource, setInstalledSource] = useState('R520.1');
  const [targetSource, setTargetSource] = useState('R530.1');
  
  // State for component details
  const [componentDetails, setComponentDetails] = useState(
    componentTypes.reduce((acc, component) => ({ ...acc, [component]: '' }), {})
  );
  
  // State for adding new version entries dynamically
  const [software, setSoftware] = useState('');
  const [version, setVersion] = useState('');
  const [currentVersions, setCurrentVersions] = useState([]);
  
  // State for migration results and UI state
  const [migrationResults, setMigrationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle component detail changes
  const handleComponentChange = (component, value) => {
    setComponentDetails(prev => ({ ...prev, [component]: value }));
  };

  // Add current version from dynamic input
  const handleAddCurrentVersion = () => {
    if (software && version) {
      setCurrentVersions([...currentVersions, { software, version }]);
      setSoftware('');
      setVersion('');
    }
  };

  // Convert current versions to format needed for API
  const convertToVersionDetails = () => {
    const versionDetails = {};
    currentVersions.forEach(item => {
      versionDetails[item.software] = item.version;
    });
    return versionDetails;
  };

  // Process the migration
  const handleProcessMigration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        installed_source: installedSource,
        source_details: componentDetails,
        target_source: targetSource,
      };
      
      // Make API call to FastAPI backend
      const response = await axios.post('http://localhost:5001/api/process_migration', requestData);
      
      // Set migration results
      setMigrationResults({
        source: installedSource,
        target: targetSource,
        updates: response.data.updates
      });
      
    } catch (err) {
      console.error('Migration processing error:', err);
      setError(err.response?.data?.detail || 'Failed to process migration');
    } finally {
      setLoading(false);
    }
  };

  // Download results as Excel
  const downloadResults = async () => {
    if (!migrationResults) return;
    
    try {
      setError(null);
      
      // Create request data
      const requestData = {
        installed_source: installedSource,
        source_details: componentDetails,
        target_source: targetSource,
      };
      
      // Make API call with responseType blob to handle file download
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5001/api/download_results',
        data: requestData,
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Add timestamp to filename
      const timestamp = new Date().getTime();
      const filename = `migration_${installedSource}_to_${targetSource}_${timestamp}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download results');
    }
  };

  return (
    <TaskLayout
      title="Software Compatibility Migration"
      description="Analyze and migrate Experion software compatibility versions between releases"
    >
      {{
        input: (
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-100 text-red-800 border border-red-300">
                {error}
              </div>
            )}
            
            {/* Installed Source */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Installed Experion Source
              </h3>
              <select
                value={installedSource}
                onChange={(e) => setInstalledSource(e.target.value)}
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {experionVersions.map((version) => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
            
            {/* Component Details */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Component Details for {installedSource}
              </h3>
              <div className="space-y-3">
                {componentTypes.map((component) => (
                  <div key={component} className="grid grid-cols-3 gap-2 items-center">
                    <label className={`col-span-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {component}:
                    </label>
                    <input
                      type="text"
                      value={componentDetails[component]}
                      onChange={(e) => handleComponentChange(component, e.target.value)}
                      placeholder="Enter version/details"
                      className={`col-span-2 p-2 rounded border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-gray-200' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target Migration Configuration */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Target Experion Migration
              </h3>
              <div className="space-y-4">
                <select
                  value={targetSource}
                  onChange={(e) => setTargetSource(e.target.value)}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {experionVersions.map((version) => (
                    <option key={version} value={version}>{version}</option>
                  ))}
                </select>
                
                <button
                  onClick={handleProcessMigration}
                  disabled={loading}
                  className={`w-full px-4 py-2 ${
                    loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white rounded flex items-center justify-center space-x-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Process Migration</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ),
        output: (
          <div className="space-y-4">
            {migrationResults ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Migration Results: {migrationResults.source} to {migrationResults.target}
                  </h3>
                  <button
                    onClick={downloadResults}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Excel</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <thead>
                      <tr className={isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}>
                        <th className="p-2 text-left border">Component</th>
                        <th className="p-2 text-left border">Current Version</th>
                        <th className="p-2 text-left border">Recommended Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(migrationResults.updates).map(([component, recommendation]) => (
                        <tr key={component} className={isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}>
                          <td className="p-2 border">{component}</td>
                          <td className="p-2 border">{componentDetails[component] || 'Not specified'}</td>
                          <td className="p-2 border">{recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete the configuration and process migration to see results
              </div>
            )}
          </div>
        )
      }}
    </TaskLayout>
  );
};

export default Task2SoftwareCompatibility;