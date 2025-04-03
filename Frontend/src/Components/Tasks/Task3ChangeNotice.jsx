import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import PDFManager from '../PDFManager';
import { useSelector } from 'react-redux';

const Task3ChangeNotice = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const [currentVersion, setCurrentVersion] = useState('');
  const [targetVersion, setTargetVersion] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleAnalyze = async () => {

    setAnalysisResults({
      currentVersion,
      targetVersion,
      newFeatures: [
        "Feature 1: Enhanced security protocols",
        "Feature 2: Improved performance optimization"
      ],
      resolvedIssues: [
        "Issue 1: Fixed memory leak in module X",
        "Issue 2: Resolved compatibility with Y system"
      ],
      knownIssues: [
        "Known Issue 1: Limited support for Z protocol",
        "Known Issue 2: Performance degradation in specific scenarios"
      ]
    });
  };

  const downloadResults = () => {
    if (!analysisResults) return;

    // Convert results to CSV format
    const csvContent = [
      "Category,Description",
      ...analysisResults.newFeatures.map(feature => `New Feature,${feature}`),
      ...analysisResults.resolvedIssues.map(issue => `Resolved Issue,${issue}`),
      ...analysisResults.knownIssues.map(issue => `Known Issue,${issue}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scn_analysis_${currentVersion}_to_${targetVersion}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TaskLayout
      title="Software Change Notice Analysis"
      description="Analyze Software Change Notices (SCN) between versions to provide accumulated lists of new features, resolved issues, and known issues. The analysis takes into account duplicate issues and tracks issue resolution across versions."
    >
      {{
        input: (
          <div className="space-y-6">
            {/* Version Selection */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Version Selection
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Current Version
                  </label>
                  <input
                    type="text"
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    placeholder="e.g., 1.0.0"
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Target Version
                  </label>
                  <input
                    type="text"
                    value={targetVersion}
                    onChange={(e) => setTargetVersion(e.target.value)}
                    placeholder="e.g., 2.0.0"
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!currentVersion || !targetVersion}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Analyze Changes
              </button>
            </div>

            {/* PDF Upload and Management */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Software Change Notices
              </h3>
              <PDFManager triggerRefresh={false} />
            </div>
          </div>
        ),
        output: (
          <div className="space-y-4">
            {analysisResults ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Analysis Results: v{currentVersion} → v{targetVersion}
                  </h3>
                  <button
                    onClick={downloadResults}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Download CSV
                  </button>
                </div>

                {/* New Features */}
                <div className="mb-6">
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Features
                  </h4>
                  <ul className={`list-disc pl-5 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {analysisResults.newFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Resolved Issues */}
                <div className="mb-6">
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Resolved Issues
                  </h4>
                  <ul className={`list-disc pl-5 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {analysisResults.resolvedIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>

                {/* Known Issues */}
                <div className="mb-6">
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Known Issues
                  </h4>
                  <ul className={`list-disc pl-5 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {analysisResults.knownIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter versions and analyze changes to see results
              </div>
            )}
          </div>
        )
      }}
    </TaskLayout>
  );
};

export default Task3ChangeNotice; 