import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Task2SoftwareCompatibility = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  
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
  
  // State for upgrade strategy and results
  // const [upgradeStrategy, setUpgradeStrategy] = useState('minimum');
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
  // const handleProcessMigration = async () => {
  //   // Combine the component details with any additional software versions 
  //   const combinedDetails = { ...componentDetails };
  //   currentVersions.forEach(item => {
  //     if (!componentTypes.includes(item.software)) {
  //       combinedDetails[item.software] = item.version;
  //     }
  //   });
    
  //   setLoading(true);
  //   setError(null);
    
  //   try {
  //     const requestData = {
  //       installed_source: installedSource,
  //       source_details: combinedDetails,
  //       target_source: targetSource,
  //       // upgrade_strategy: upgradeStrategy
  //     };
      
    
  //     // Make API call
  //     const response = await axios.post('/api/process_migration', requestData);
      
  //     // Set migration results 
  //     setMigrationResults({
  //       source: installedSource,
  //       target: targetSource,
  //       updates: response.data.updates || {
  //         'Domain Controller': 'Windows Server 2022',
  //         'Server Hardware': 'Dell R740XL Server',
  //         'Workstation Hardware': 'Dell R7960XL Workstation'
  //       }
  //     });
      
  //   } catch (err) {
  //     console.error('Migration processing error:', err);
  //     setError(err.response?.data?.message || 'Failed to process migration');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleProcessMigration = async () => {
  // Combine the component details with any additional software versions 
  const combinedDetails = { ...componentDetails };
  currentVersions.forEach(item => {
    if (!componentTypes.includes(item.software)) {
      combinedDetails[item.software] = item.version;
    }
  });
  
  setLoading(true);
  setError(null);
  
  try {
    const requestData = {
      installed_source: installedSource,
      source_details: combinedDetails,
      target_source: targetSource,
    };
    
    // Make API call to FastAPI backend
    const response = await axios.post('/api/process_migration', requestData);
    
    // Set migration results
    setMigrationResults({
      source: installedSource,
      target: targetSource,
      updates: response.data.updates || {}
    });
    
  } catch (err) {
    console.error('Migration processing error:', err);
    setError(err.response?.data?.detail || 'Failed to process migration');
  } finally {
    setLoading(false);
  }
};
  // Download results as Excel
  // const downloadResults = () => {
  //   if (!migrationResults) return;
    
  //   try {
  //     // Create data for Excel from results
  //     const data = Object.entries(migrationResults.updates).map(([component, recommendation]) => {
  //       const currentDetail = componentDetails[component] || 
  //                           currentVersions.find(v => v.software === component)?.version || 
  //                           'Not specified';
        
  //       return {
  //         Component: component,
  //         'Current Version': currentDetail,
  //         'Recommended Version': recommendation
  //       };
  //     });
      
  //     // Create worksheet and workbook
  //     const worksheet = XLSX.utils.json_to_sheet(data);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Migration Results');
      
  //     // Add timestamp to filename to make it unique
  //     const timestamp = new Date().getTime();
  //     const filename = `migration_${installedSource}_to_${targetSource}_${timestamp}.xlsx`;
      
  //     XLSX.writeFile(workbook, filename);
  //   } catch (err) {
  //     console.error('Download error:', err);
  //     setError('Failed to download results');
  //   }
  // };
const downloadResults = async () => {
  if (!migrationResults) return;
  
  try {
    // Create request data
    const requestData = {
      installed_source: installedSource,
      source_details: componentDetails,
      target_source: targetSource,
    };
    
    // Make API call with responseType blob to handle file download
    const response = await axios({
      method: 'post',
      url: '/api/download_results',
      data: requestData,
      responseType: 'blob' // Important for file downloads
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
                  } text-white rounded`}
                >
                  {loading ? 'Processing...' : 'Process Migration'}
                </button>
              </div>
            </div>
          </div>
        ),
        output: (
          <div className="space-y-4">
            {migrationResults ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Migration Results: {migrationResults.source} to {migrationResults.target}
                </h3>
                
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
                      {Object.entries(migrationResults.updates).map(([component, recommendation]) => {
                        const currentDetail = componentDetails[component] || 
                                           currentVersions.find(v => v.software === component)?.version || 
                                           'Not specified';
                        
                        return (
                          <tr key={component} className={isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}>
                            <td className="p-2 border">{component}</td>
                            <td className="p-2 border">{currentDetail}</td>
                            <td className="p-2 border">{recommendation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <button
                  onClick={downloadResults}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                >
                  Download Results as Excel
                </button>
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