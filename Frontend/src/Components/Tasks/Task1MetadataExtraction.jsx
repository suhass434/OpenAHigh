import React, { useState } from 'react';
import TaskLayout from './TaskLayout';
import PDFManager from '../PDFManager';
import { useSelector } from 'react-redux';
import { Upload } from 'lucide-react';
import axios from 'axios';

const Task1MetadataExtraction = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const [extractedMetadata, setExtractedMetadata] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.signupData);
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('file[]', file);
      });
      formData.append('userEmail', user.email);

      const response = await axios.post(
        'http://localhost:5001/upload-pdf/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.message === "Files uploaded successfully") {
        setTriggerRefresh(prev => !prev);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload PDF(s). Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleExtractMetadata = async (pdfFile) => {
    // TODO: Implement metadata extraction logic
    setExtractedMetadata({
      filename: pdfFile.name,
      metadata: {
        title: "Sample Title",
        author: "Sample Author",
        creationDate: "2024-03-15",
        modificationDate: "2024-03-15",
        keywords: ["keyword1", "keyword2"],
        subject: "Sample Subject"
      }
    });
  };

  const downloadCSV = () => {
    if (!extractedMetadata) return;

    const metadata = extractedMetadata.metadata;
    const csvContent = [
      "Property,Value",
      `Filename,${extractedMetadata.filename}`,
      `Title,${metadata.title}`,
      `Author,${metadata.author}`,
      `Creation Date,${metadata.creationDate}`,
      `Modification Date,${metadata.modificationDate}`,
      `Keywords,${metadata.keywords.join('; ')}`,
      `Subject,${metadata.subject}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `metadata_${extractedMetadata.filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TaskLayout
      title="PDF Metadata Extraction"
      description="Extract pre-defined critical information from each document and fill the metadata fields in a format like CSV/excel. The extraction has to be done for multiple documents (PDF) presented in a folder."
    >
      {{
        input: (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Upload New PDFs
              </h3>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${
                    isDarkMode
                      ? 'border-gray-500 hover:border-gray-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`mb-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PDF files only
                    </p>
                    {uploading && (
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                        Uploading...
                      </p>
                    )}
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>

            {/* Existing PDFs Section */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Your PDFs
              </h3>
              <PDFManager 
                triggerRefresh={triggerRefresh}
                onSelectPDF={handleExtractMetadata}
              />
            </div>
          </div>
        ),
        output: (
          <div className="space-y-4">
            {extractedMetadata ? (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Extracted Metadata: {extractedMetadata.filename}
                  </h3>
                  <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Download CSV
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(extractedMetadata.metadata).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <div className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {Array.isArray(value) ? value.join(', ') : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a PDF to extract metadata
              </div>
            )}
          </div>
        )
      }}
    </TaskLayout>
  );
};

export default Task1MetadataExtraction; 