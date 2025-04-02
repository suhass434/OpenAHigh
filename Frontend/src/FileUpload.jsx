import React, { useState, useRef } from 'react';
import { CloudUploadIcon, XIcon } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadComplete }) => {  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'application/pdf'
      );
      
      if (newFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...newFiles]);
      } else {
        setError('Only PDF files are accepted.');
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        
        // Process each file and create FormData
        const file = selectedFiles[0]; // For simplicity, process one file at a time
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload with progress tracking
        const response = await axios.post('http://localhost:8000/document-process/', formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        // Process response
        console.log('Upload and document processing completed:', response.data);
        
        // If document processing was successful, return the result
        if (onUploadComplete) {
          onUploadComplete([response.data]);
        }
        
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <form 
          onDragEnter={handleDrag}
          onSubmit={handleSubmit}
          className={`relative p-6 border-2 border-dashed rounded-lg text-center 
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input 
            ref={inputRef}
            type="file" 
            multiple 
            onChange={handleChange}
            className="hidden"
            accept=".pdf,application/pdf"
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <CloudUploadIcon className="w-16 h-16 text-gray-400" />
            <p className="text-gray-600">
              Drag & drop your PDF files here
            </p>
            <button 
              type="button"
              onClick={() => inputRef.current.click()}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              Browse PDFs
            </button>
          </div>
          {dragActive && 
            <div 
              className="absolute inset-0 z-50"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            ></div>
          }
        </form>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected PDF:</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Remove file"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || selectedFiles.length === 0}
            className={`w-full py-2 px-4 rounded-md text-white font-medium 
              ${isUploading || selectedFiles.length === 0
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
              }`}
          >
            {isUploading ? 'Processing...' : 'Upload and Process PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
