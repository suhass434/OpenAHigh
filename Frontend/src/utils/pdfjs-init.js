import { pdfjs } from 'react-pdf';

// Ensure PDF.js worker is loaded
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`; 