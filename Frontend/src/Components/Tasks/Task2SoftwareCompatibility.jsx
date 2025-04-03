import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

const Task2SoftwareCompatibility = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const [masterSheet, setMasterSheet] = useState(null);
  const [currentVersions, setCurrentVersions] = useState([]);
  const [targetSoftware, setTargetSoftware] = useState('');
  const [targetVersion, setTargetVersion] = useState('');
  const [upgradeStrategy, setUpgradeStrategy] = useState('minimum');
  const [compatibilityResults, setCompatibilityResults] = useState(null);
  const [software, setSoftware] = useState('');
  const [version, setVersion] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setMasterSheet(data);
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleAddCurrentVersion = () => {
    if (software && version) {
      setCurrentVersions([...currentVersions, { software, version }]);
      setSoftware('');
      setVersion('');
    }
  };

  const handleAnalyzeCompatibility = () => {
  
    setCompatibilityResults({
      targetSoftware,
      targetVersion,
      requiredUpdates: [
        { software: 'Software A', currentVersion: '1.0', requiredVersion: '2.0' },
        { software: 'Software B', currentVersion: '3.0', requiredVersion: '3.5' },
      ]
    });
  };

  const downloadResults = () => {
    if (!compatibilityResults) return;

    const worksheet = XLSX.utils.json_to_sheet(compatibilityResults.requiredUpdates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Compatibility Results');
    XLSX.writeFile(workbook, 'compatibility_results.xlsx');
  };

  return (
    <TaskLayout
      title="Software Compatibility Updates"
      description="Analyze software version dependencies and provide upgrade recommendations based on a master compatibility sheet. Define upgrade criteria and get advised on required version updates for dependent software."
    >
      {{
        input: (
          <div className="space-y-6">
            {/* Master Sheet Upload */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Upload Master Compatibility Sheet
              </h3>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className={`w-full p-2 rounded border ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Current Versions Input */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Current Software Versions
              </h3>
              <div className="space-y-4">
                {currentVersions.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {item.software} - v{item.version}
                    </span>
                    <button
                      onClick={() => setCurrentVersions(currentVersions.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Software Name"
                    value={software}
                    onChange={(e) => setSoftware(e.target.value)}
                    className={`flex-1 p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={`w-32 p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    onClick={handleAddCurrentVersion}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Target Software Update */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Target Update
              </h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Target Software"
                    value={targetSoftware}
                    onChange={(e) => setTargetSoftware(e.target.value)}
                    className={`flex-1 p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Target Version"
                    value={targetVersion}
                    onChange={(e) => setTargetVersion(e.target.value)}
                    className={`w-32 p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <select
                  value={upgradeStrategy}
                  onChange={(e) => setUpgradeStrategy(e.target.value)}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-gray-200' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="minimum">Minimum Required Updates</option>
                  <option value="latest">Always Latest Versions</option>
                  <option value="stable">Stable Versions Only</option>
                </select>
                <button
                  onClick={handleAnalyzeCompatibility}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={!masterSheet || !targetSoftware || !targetVersion}
                >
                  Analyze Compatibility
                </button>
              </div>
            </div>
          </div>
        ),
        output: (
          <div className="space-y-4">
            {compatibilityResults ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Required Updates for {compatibilityResults.targetSoftware} v{compatibilityResults.targetVersion}
                </h3>
                <div className="space-y-4">
                  {compatibilityResults.requiredUpdates.map((update, index) => (
                    <div key={index} className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {update.software}
                        </span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {update.currentVersion} → {update.requiredVersion}
                        </span>
                      </div>
                    </div>
                  ))}
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
                Upload a master sheet and analyze compatibility to see results
              </div>
            )}
          </div>
        )
      }}
    </TaskLayout>
  );
};

export default Task2SoftwareCompatibility; 