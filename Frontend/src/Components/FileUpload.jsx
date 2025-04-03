// import React, { useState, useRef } from 'react';
// import { CloudUploadIcon, XIcon } from 'lucide-react';
// import axios from 'axios';
// import { useSelector } from 'react-redux';

// const FileUpload = ({ onUploadComplete }) => {  
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [dragActive, setDragActive] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [error, setError] = useState(null);
//   const inputRef = useRef(null);
  
//   // Get user data and token from Redux store
//   const token = useSelector((state) => state.auth.token);
//   const user = useSelector((state) => state.auth.signupData);
  
//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files) {
//       const newFiles = Array.from(e.dataTransfer.files).filter(file => 
//         file.type === 'application/pdf'
//       );
      
//       if (newFiles.length > 0) {
//         setSelectedFiles(prev => [...prev, ...newFiles]);
//       } else {
//         setError('Only PDF files are accepted.');
//       }
//     }
//   };

//   const handleChange = (e) => {
//     e.preventDefault();
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setSelectedFiles(prev => [...prev, ...newFiles]);
//     }
//   };

//   const removeFile = (fileName) => {
//     setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     try {
//       if (selectedFiles.length > 0) {
//         setIsUploading(true);
//         const formData = new FormData();
        
//         // Process each file and create FormData
//         selectedFiles.forEach((file) => {
//           formData.append(`file[]`, file);
//         });
        
//         // Add user email to the form data
//         const userEmail = user?.email || localStorage.getItem('userEmail');
//         if (!userEmail) {
//           throw new Error('User email not found. Please log in again.');
//         }
//         formData.append('userEmail', userEmail);
       
//         console.log('Files to upload:', formData.getAll('file[]'));
//         console.log('User email:', userEmail);

//         // Upload with progress tracking
//         const response = await axios({
//           method: 'post',
//           url: 'http://localhost:5001/upload-pdf/',
//           data: formData,
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'Authorization': `Bearer ${token || localStorage.getItem('token')}`
//           },
//           withCredentials: true,
//           onUploadProgress: (progressEvent) => {
//             const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             setUploadProgress(percentCompleted);
//           }
//         });
        
//         // Process response
//         console.log('Upload and document processing completed:', response.data);
        
//         // Clear selected files on successful upload
//         setSelectedFiles([]);
        
//         // If document processing was successful, return the result and trigger refresh
//         if (onUploadComplete) {
//           onUploadComplete(response.data);
//         }
        
//         window.location.reload();
//       }
//     } catch (err) {
//       console.error('Upload failed:', err);
//       setError(err.response?.data?.error || err.message || 'Upload failed. Please try again.');
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
//       <div className="p-6">
//         <form 
//           onDragEnter={handleDrag}
//           onSubmit={handleSubmit}
//           className={`relative p-6 border-2 border-dashed rounded-lg text-center 
//             ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
//         >
//           <input 
//             ref={inputRef}
//             type="file" 
//             multiple 
//             onChange={handleChange}
//             className="hidden"
//             accept=".pdf,application/pdf"
//           />
          
//           <div className="flex flex-col items-center justify-center space-y-4">
//             <CloudUploadIcon className="w-16 h-16 text-gray-400" />
//             <p className="text-gray-700 font-medium">
//               Drag & drop your PDF files here
//             </p>
//             <button 
//               type="button"
//               onClick={() => inputRef.current.click()}
//               className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
//             >
//               Browse PDFs
//             </button>
//           </div>
//           {dragActive && 
//             <div 
//               className="absolute inset-0 z-50"
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//             ></div>
//           }
//         </form>

//         {/* Selected Files List */}
//         {selectedFiles.length > 0 && (
//           <div className="mt-4">
//             <h3 className="text-sm font-medium text-gray-800 mb-2">Selected PDF:</h3>
//             <ul className="space-y-2">
//               {selectedFiles.map((file, index) => (
//                 <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
//                   <div className="flex items-center">
//                     <span className="text-sm text-gray-800 truncate max-w-xs">{file.name}</span>
//                     <span className="ml-2 text-xs text-gray-600">
//                       ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => removeFile(file.name)}
//                     className="p-1 text-gray-600 hover:text-red-500"
//                     title="Remove file"
//                   >
//                     <XIcon className="h-4 w-4" />
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
//             {error}
//           </div>
//         )}

//         {/* Upload Progress */}
//         {isUploading && (
//           <div className="mt-4">
//             <div className="flex justify-between text-sm text-gray-700 mb-1">
//               <span>Uploading...</span>
//               <span>{uploadProgress}%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div 
//                 className="bg-indigo-600 h-2 rounded-full" 
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}

//         {/* Submit Button */}
//         <div className="mt-6">
//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={isUploading || selectedFiles.length === 0}
//             className={`w-full py-2 px-4 rounded-md text-white font-medium 
//               ${isUploading || selectedFiles.length === 0
//                 ? 'bg-gray-300 cursor-not-allowed' 
//                 : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
//               }`}
//           >
//             {isUploading ? 'Processing...' : 'Upload and Process PDF'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FileUpload;
import React, { useState, useRef } from 'react';
import { CloudUploadIcon, XIcon } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const FileUpload = ({ onUploadComplete }) => {  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  
  // Get user data and token from Redux store
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.signupData);
  // Get dark mode state from Redux store
  const isDarkMode = useSelector(state => state.theme.darkMode);
  
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
        const formData = new FormData();
        
        // Process each file and create FormData
        selectedFiles.forEach((file) => {
          formData.append(`file[]`, file);
        });
        
        // Add user email to the form data
        const userEmail = user?.email || localStorage.getItem('userEmail');
        if (!userEmail) {
          throw new Error('User email not found. Please log in again.');
        }
        formData.append('userEmail', userEmail);
       
        console.log('Files to upload:', formData.getAll('file[]'));
        console.log('User email:', userEmail);

        // Upload with progress tracking
        const response = await axios({
          method: 'post',
          url: 'http://localhost:5001/upload-pdf/',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token || localStorage.getItem('token')}`
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        // Process response
        console.log('Upload and document processing completed:', response.data);
        
        // Clear selected files on successful upload
        setSelectedFiles([]);
        
        // If document processing was successful, return the result and trigger refresh
        if (onUploadComplete) {
          onUploadComplete(response.data);
        }
        
        window.location.reload();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={`max-w-xl mx-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg overflow-hidden`}>
      <div className="p-6">
        <form 
          onDragEnter={handleDrag}
          onSubmit={handleSubmit}
          className={`relative p-6 border-2 border-dashed rounded-lg text-center 
            ${dragActive 
              ? isDarkMode 
                ? 'border-blue-400 bg-blue-900/30'
                : 'border-blue-500 bg-blue-50' 
              : isDarkMode 
                ? 'border-gray-600'
                : 'border-gray-300'}`}
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
            <CloudUploadIcon className={`w-16 h-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
              Drag & drop your PDF files here
            </p>
            <button 
              type="button"
              onClick={() => inputRef.current.click()}
              className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white rounded-md transition-colors`}
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
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-2`}>Selected PDF:</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className={`flex justify-between items-center p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-md`}>
                  <div className="flex items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} truncate max-w-xs`}>{file.name}</span>
                    <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className={`p-1 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-500'}`}
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
          <div className={`mt-4 p-3 ${isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600'} rounded-md text-sm`}>
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div 
                className={`${isDarkMode ? 'bg-blue-500' : 'bg-indigo-600'} h-2 rounded-full`} 
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
                ? isDarkMode 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gray-300 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 transition-colors'
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