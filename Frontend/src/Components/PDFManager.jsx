// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { 
//   FileIcon, 
//   TrashIcon, 
//   DownloadIcon, 
//   EyeIcon,
//   XIcon,
//   ZoomInIcon,
//   ZoomOutIcon,
//   RotateCwIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon
// } from 'lucide-react';
// import { Document, Page } from 'react-pdf';
// import '../utils/pdfjs-init';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';


// const pdfjsVersion = '3.4.120';
// const pdfjsWorker = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
// if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
//   window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// }

// const PDFManager = ({ triggerRefresh }) => {
//   const [pdfs, setPdfs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedPDF, setSelectedPDF] = useState(null);
//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [pdfError, setPdfError] = useState(null);
//   const [pdfLoading, setPdfLoading] = useState(false);
//   const [scale, setScale] = useState(1.2);
//   const [rotation, setRotation] = useState(0);
//   const user = useSelector((state) => state.auth.signupData);

//   useEffect(() => {
//     if (user?.email) {
//       fetchPDFs();
//     }
//   }, [user?.email, triggerRefresh]);

//   const fetchPDFs = async () => {
//     try {
//       if (!user?.email) {
//         setError('User email not found. Please log in again.');
//         setLoading(false);
//         return;
//       }

//       console.log('Fetching PDFs for email:', user.email);
//       const encodedEmail = encodeURIComponent(user.email);
//       const response = await axios.get(`http://localhost:5001/pdfs/${encodedEmail}`);
//       console.log('PDF response:', response.data);
      
//       // Sort PDFs by last_modified date (newest first)
//       const sortedPdfs = (response.data.files || []).sort((a, b) => {
//         return new Date(b.last_modified) - new Date(a.last_modified);
//       });
      
//       setPdfs(sortedPdfs);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching PDFs:', err);
//       setError(err.response?.data?.detail || 'Failed to fetch PDFs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (filename) => {
//     try {
//       const encodedEmail = encodeURIComponent(user.email);
//       await axios.delete(`http://localhost:5001/pdfs/${encodedEmail}/${filename}`);
//       await fetchPDFs(); 
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Failed to delete PDF');
//     }
//   };

//   const handleDownload = async (filename) => {
//     try {
//       const encodedEmail = encodeURIComponent(user.email);
//       const response = await axios.get(
//         `http://localhost:5001/pdfs/${encodedEmail}/${filename}`,
//         { responseType: 'blob' }
//       );
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', filename);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Failed to download PDF');
//     }
//   };

//   const handleView = async (filename) => {
//     try {
//       setPdfError(null);
//       setPdfLoading(true);
//       setScale(1.2);
//       setRotation(0);
//       const encodedEmail = encodeURIComponent(user.email);
//       const response = await axios.get(
//         `http://localhost:5001/pdfs/${encodedEmail}/${filename}`,
//         { 
//           responseType: 'arraybuffer',
//           headers: {
//             'Accept': 'application/pdf'
//           }
//         }
//       );
      
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       setSelectedPDF({ url, filename });
//       setPageNumber(1);
//       setError(null);
//     } catch (err) {
//       console.error('PDF View Error:', err);
//       setPdfError('Failed to load PDF file. Please try again.');
//       setError(err.response?.data?.detail || 'Failed to view PDF');
//     } finally {
//       setPdfLoading(false);
//     }
//   };

//   const onDocumentLoadSuccess = ({ numPages }) => {
//     setNumPages(numPages);
//     setPdfError(null);
//   };

//   const onDocumentLoadError = (error) => {
//     console.error('PDF Load Error:', error);
//     setPdfError('Failed to load PDF file. Please try again.');
//   };

//   const changePage = (offset) => {
//     setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
//   };

//   const adjustZoom = (delta) => {
//     setScale(prevScale => Math.max(0.5, Math.min(2.5, prevScale + delta)));
//   };

//   const rotate = () => {
//     setRotation(prevRotation => (prevRotation + 90) % 360);
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const formatDate = (isoString) => {
//     return new Date(isoString).toLocaleString();
//   };

//   const closePdfViewer = () => {
//     if (selectedPDF) {
//       window.URL.revokeObjectURL(selectedPDF.url);
//       setSelectedPDF(null);
//       setNumPages(null);
//       setPageNumber(1);
//     }
//   };

//   if (!user?.email) {
//     return (
//       <div className="text-center py-8 text-red-600">
//         Please log in to view your PDFs.
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <h2 className="text-2xl font-bold mb-6">Your PDFs</h2>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {selectedPDF && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4 z-50">
//           <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
//             <div className="p-4 flex justify-between items-center border-b bg-gray-50">
//               <div className="flex items-center space-x-2">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {selectedPDF.filename}
//                 </h3>
//               </div>
//               <button
//                 onClick={closePdfViewer}
//                 className="p-1 hover:bg-gray-200 rounded text-gray-700"
//                 title="Close"
//               >
//                 <XIcon className="h-6 w-6" />
//               </button>
//             </div>
            
//             <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => changePage(-1)}
//                   disabled={pageNumber <= 1}
//                   className="p-2 bg-blue-500 text-white rounded disabled:opacity-50 flex items-center"
//                   title="Previous Page"
//                 >
//                   <ChevronLeftIcon className="h-4 w-4" />
//                   <span className="ml-1">Prev</span>
//                 </button>
//                 <div className="text-gray-800 font-medium">
//                   Page {pageNumber} of {numPages || '?'}
//                 </div>
//                 <button
//                   onClick={() => changePage(1)}
//                   disabled={pageNumber >= numPages}
//                   className="p-2 bg-blue-500 text-white rounded disabled:opacity-50 flex items-center"
//                   title="Next Page"
//                 >
//                   <span className="mr-1">Next</span>
//                   <ChevronRightIcon className="h-4 w-4" />
//                 </button>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => adjustZoom(-0.2)}
//                   className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
//                   title="Zoom Out"
//                 >
//                   <ZoomOutIcon className="h-4 w-4" />
//                 </button>
//                 <span className="text-gray-800">{Math.round(scale * 100)}%</span>
//                 <button
//                   onClick={() => adjustZoom(0.2)}
//                   className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
//                   title="Zoom In"
//                 >
//                   <ZoomInIcon className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={rotate}
//                   className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded ml-2"
//                   title="Rotate"
//                 >
//                   <RotateCwIcon className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="flex-1 p-6 overflow-auto flex justify-center bg-gray-200">
//               {pdfError ? (
//                 <div className="flex items-center justify-center text-red-600 bg-white p-4 rounded">
//                   {pdfError}
//                 </div>
//               ) : pdfLoading ? (
//                 <div className="flex justify-center items-center h-full">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//               ) : (
//                 <Document
//                   file={selectedPDF.url}
//                   onLoadSuccess={onDocumentLoadSuccess}
//                   onLoadError={onDocumentLoadError}
//                   loading={
//                     <div className="flex justify-center items-center h-full">
//                       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//                     </div>
//                   }
//                 >
//                   <Page
//                     pageNumber={pageNumber}
//                     renderTextLayer={true}
//                     renderAnnotationLayer={true}
//                     className="shadow-lg bg-white"
//                     scale={scale}
//                     rotate={rotation}
//                   />
//                 </Document>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid gap-4">
//         {pdfs.length === 0 ? (
//           <div className="text-center py-8 text-gray-600 bg-white p-6 rounded-lg shadow">
//             No PDFs found. Upload some files to get started.
//           </div>
//         ) : (
//           pdfs.map((pdf) => (
//             <div
//               key={pdf.path}
//               className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center space-x-4">
//                 <FileIcon className="h-8 w-8 text-red-500" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">{pdf.filename}</h3>
//                   <div className="text-sm text-gray-600">
//                     {formatFileSize(pdf.size)} • {formatDate(pdf.last_modified)}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => handleView(pdf.filename)}
//                   className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                   title="View PDF"
//                 >
//                   <EyeIcon className="h-5 w-5" />
//                 </button>
//                 <button
//                   onClick={() => handleDownload(pdf.filename)}
//                   className="p-2 text-green-600 hover:bg-green-50 rounded"
//                   title="Download PDF"
//                 >
//                   <DownloadIcon className="h-5 w-5" />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(pdf.filename)}
//                   className="p-2 text-red-600 hover:bg-red-50 rounded"
//                   title="Delete PDF"
//                 >
//                   <TrashIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default PDFManager;
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FileIcon, 
  TrashIcon, 
  DownloadIcon, 
  EyeIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { Document, Page } from 'react-pdf';
import '../utils/pdfjs-init';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';


const pdfjsVersion = '3.4.120';
const pdfjsWorker = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const PDFManager = ({ triggerRefresh }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  
  // Get user data and dark mode state from Redux store
  const user = useSelector((state) => state.auth.signupData);
  const isDarkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (user?.email) {
      fetchPDFs();
    }
  }, [user?.email, triggerRefresh]);

  const fetchPDFs = async () => {
    try {
      if (!user?.email) {
        setError('User email not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Fetching PDFs for email:', user.email);
      const encodedEmail = encodeURIComponent(user.email);
      const response = await axios.get(`http://localhost:5001/pdfs/${encodedEmail}`);
      console.log('PDF response:', response.data);
      
      // Sort PDFs by last_modified date (newest first)
      const sortedPdfs = (response.data.files || []).sort((a, b) => {
        return new Date(b.last_modified) - new Date(a.last_modified);
      });
      
      setPdfs(sortedPdfs);
      setError(null);
    } catch (err) {
      console.error('Error fetching PDFs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      const encodedEmail = encodeURIComponent(user.email);
      await axios.delete(`http://localhost:5001/pdfs/${encodedEmail}/${filename}`);
      await fetchPDFs(); 
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete PDF');
    }
  };

  const handleDownload = async (filename) => {
    try {
      const encodedEmail = encodeURIComponent(user.email);
      const response = await axios.get(
        `http://localhost:5001/pdfs/${encodedEmail}/${filename}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download PDF');
    }
  };

  const handleView = async (filename) => {
    try {
      setPdfError(null);
      setPdfLoading(true);
      setScale(1.2);
      setRotation(0);
      const encodedEmail = encodeURIComponent(user.email);
      const response = await axios.get(
        `http://localhost:5001/pdfs/${encodedEmail}/${filename}`,
        { 
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setSelectedPDF({ url, filename });
      setPageNumber(1);
      setError(null);
    } catch (err) {
      console.error('PDF View Error:', err);
      setPdfError('Failed to load PDF file. Please try again.');
      setError(err.response?.data?.detail || 'Failed to view PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    setPdfError('Failed to load PDF file. Please try again.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const adjustZoom = (delta) => {
    setScale(prevScale => Math.max(0.5, Math.min(2.5, prevScale + delta)));
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  const closePdfViewer = () => {
    if (selectedPDF) {
      window.URL.revokeObjectURL(selectedPDF.url);
      setSelectedPDF(null);
      setNumPages(null);
      setPageNumber(1);
    }
  };

  if (!user?.email) {
    return (
      <div className={`text-center py-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
        Please log in to view your PDFs.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your PDFs</h2>
      
      {error && (
        <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-4`}>
          {error}
        </div>
      )}

      {selectedPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg w-full max-w-5xl h-[90vh] flex flex-col`}>
            <div className={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-2">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {selectedPDF.filename}
                </h3>
              </div>
              <button
                onClick={closePdfViewer}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                title="Close"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className={`p-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border-b flex justify-between items-center`}>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className={`p-2 bg-blue-500 text-white rounded disabled:opacity-50 flex items-center ${isDarkMode ? 'hover:bg-blue-600' : ''}`}
                  title="Previous Page"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="ml-1">Prev</span>
                </button>
                <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                  Page {pageNumber} of {numPages || '?'}
                </div>
                <button
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className={`p-2 bg-blue-500 text-white rounded disabled:opacity-50 flex items-center ${isDarkMode ? 'hover:bg-blue-600' : ''}`}
                  title="Next Page"
                >
                  <span className="mr-1">Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustZoom(-0.2)}
                  className={`p-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded`}
                  title="Zoom Out"
                >
                  <ZoomOutIcon className="h-4 w-4" />
                </button>
                <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => adjustZoom(0.2)}
                  className={`p-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded`}
                  title="Zoom In"
                >
                  <ZoomInIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={rotate}
                  className={`p-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded ml-2`}
                  title="Rotate"
                >
                  <RotateCwIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className={`flex-1 p-6 overflow-auto flex justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
              {pdfError ? (
                <div className={`flex items-center justify-center ${isDarkMode ? 'text-red-400 bg-gray-800' : 'text-red-600 bg-white'} p-4 rounded`}>
                  {pdfError}
                </div>
              ) : pdfLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Document
                  file={selectedPDF.url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg bg-white"
                    scale={scale}
                    rotate={rotation}
                  />
                </Document>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {pdfs.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-white'} p-6 rounded-lg shadow`}>
            No PDFs found. Upload some files to get started.
          </div>
        ) : (
          pdfs.map((pdf) => (
            <div
              key={pdf.path}
              className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center space-x-4">
                <FileIcon className={`h-8 w-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{pdf.filename}</h3>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatFileSize(pdf.size)} • {formatDate(pdf.last_modified)}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(pdf.filename)}
                  className={`p-2 ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'} rounded`}
                  title="View PDF"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(pdf.filename)}
                  className={`p-2 ${isDarkMode ? 'text-green-400 hover:bg-green-900/30' : 'text-green-600 hover:bg-green-50'} rounded`}
                  title="Download PDF"
                >
                  <DownloadIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(pdf.filename)}
                  className={`p-2 ${isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} rounded`}
                  title="Delete PDF"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PDFManager;