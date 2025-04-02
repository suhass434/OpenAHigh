import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FileIcon, 
  TrashIcon, 
  DownloadIcon, 
  EyeIcon,
  XIcon 
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

const PDFManager = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const user = useSelector((state) => state.auth.signupData);

  useEffect(() => {
    if (user?.email) {
      fetchPDFs();
    }
  }, [user?.email]);

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
      setPdfs(response.data.files || []);
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
      setSelectedPDF(url);
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

  if (!user?.email) {
    return (
      <div className="text-center py-8 text-red-500">
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
      <h2 className="text-2xl font-bold mb-6">Your PDFs</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {selectedPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">PDF Viewer</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() => changePage(1)}
                    disabled={pageNumber >= numPages}
                    className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPDF(null);
                  window.URL.revokeObjectURL(selectedPDF);
                  setNumPages(null);
                  setPageNumber(1);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto flex justify-center">
              {pdfError ? (
                <div className="flex items-center justify-center text-red-500">
                  {pdfError}
                </div>
              ) : pdfLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Document
                  file={selectedPDF}
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
                    className="shadow-lg"
                    scale={1.2}
                  />
                </Document>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {pdfs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No PDFs found. Upload some files to get started.
          </div>
        ) : (
          pdfs.map((pdf) => (
            <div
              key={pdf.path}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <FileIcon className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-medium">{pdf.filename}</h3>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(pdf.size)} • {formatDate(pdf.last_modified)}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleView(pdf.filename)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="View PDF"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(pdf.filename)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Download PDF"
                >
                  <DownloadIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(pdf.filename)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
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