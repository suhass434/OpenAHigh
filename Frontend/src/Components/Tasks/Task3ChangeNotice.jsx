import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import { useSelector } from 'react-redux';
import { FileDown } from 'lucide-react';
import axios from 'axios';

const Task3ChangeNotice = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const [oldVersion, setOldVersion] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('features');
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/scn/process', {
        old_version: oldVersion,
        new_version: newVersion,
        include_features: true,
        include_issues: true
      });

      // Ensure fixed_issues and known_issues are arrays
      const processedData = {
        ...response.data,
        fixed_issues: response.data.fixed_issues || [],
        known_issues: response.data.known_issues || []
      };
      
      setResults(processedData);
      console.log('Processed data:', processedData); // Debug log
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.detail || 'Failed to analyze software change notices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileType) => {
    try {
      setError(null);
      setDownloading(true);
      let filename;
      if (fileType === 'fixed') {
        filename = `Fixed_Issues_${oldVersion}_to_${newVersion}.csv`;
      } else if (fileType === 'known') {
        filename = `Known_Issues_${oldVersion}_to_${newVersion}.csv`;
      } else {
        filename = `New_Features_${oldVersion}_to_${newVersion}.md`;
      }

      const response = await axios.get(`http://localhost:5001/api/scn/download/${filename}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download the file. Make sure the analysis has been run first.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TaskLayout
      title="Software Change Notice Analysis"
      description="Analyze Software Change Notices (SCN) between two versions to extract new features, fixed issues, and known issues."
    >
      {{
        input: (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Select Versions
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Old Version
                  </label>
                  <input
                    type="text"
                    value={oldVersion}
                    onChange={(e) => setOldVersion(e.target.value)}
                    placeholder="e.g., R511.2_SCN"
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Version
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g., R511.4_SCN"
                    className={`w-full p-2 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                  } text-white font-medium`}
                >
                  {loading ? 'Analyzing...' : 'Analyze Changes'}
                </button>
              </form>
            </div>
          </div>
        ),
        output: (
          <div className="space-y-6">
            {error && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>
                {error}
              </div>
            )}
            
            {results && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => handleDownload('features')}
                    disabled={downloading}
                    className={`flex items-center px-4 py-2 rounded ${
                      downloading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Features'}
                  </button>
                  <button
                    onClick={() => handleDownload('fixed')}
                    disabled={downloading}
                    className={`flex items-center px-4 py-2 rounded ${
                      downloading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Fixed Issues'}
                  </button>
                  <button
                    onClick={() => handleDownload('known')}
                    disabled={downloading}
                    className={`flex items-center px-4 py-2 rounded ${
                      downloading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isDarkMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Known Issues'}
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="flex border-b">
                    <button
                      className={`px-4 py-2 ${
                        activeTab === 'features'
                          ? isDarkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-white text-gray-900'
                          : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}
                      onClick={() => setActiveTab('features')}
                    >
                      New Features
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        activeTab === 'fixed'
                          ? isDarkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-white text-gray-900'
                          : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}
                      onClick={() => setActiveTab('fixed')}
                    >
                      Fixed Issues
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        activeTab === 'known'
                          ? isDarkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-white text-gray-900'
                          : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                      }`}
                      onClick={() => setActiveTab('known')}
                    >
                      Known Issues
                    </button>
                  </div>

                  <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {activeTab === 'features' && (
                      <div className="space-y-4">
                        {Object.entries(results.features).map(([version, features]) => (
                          <div key={version} className={`p-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              {version}
                            </h4>
                            <pre className={`whitespace-pre-wrap font-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {features}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'fixed' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">PAR</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Impact</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Subsystem</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {results.fixed_issues.map((issue, index) => (
                              <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.PAR}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.Impact}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.Subsystem}</td>
                                <td className="px-6 py-4">{issue.Description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'known' && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">PAR</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Impact</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Function</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {results.known_issues.map((issue, index) => (
                              <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.PAR}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.Impact}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{issue.Function}</td>
                                <td className="px-6 py-4">{issue.Description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }}
    </TaskLayout>
  );
};

export default Task3ChangeNotice; 