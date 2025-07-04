import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import SignaturePlacement from './SignaturePlacement';
import { useSignatures } from '../hooks/useSignatures';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
const PDFViewer = ({ url, documentId }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const pageRef = useRef(null);

  const { signatures, addSignaturePlaceholder, signDocument } = useSignatures(documentId);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePageLoadSuccess = (page) => {
    if (pageRef.current) {
      const { width, height } = pageRef.current.getBoundingClientRect();
      setPageDimensions({ width, height });
    }
  };

  return (
    <div className="relative">
      {/* PDF Controls */}
      <div className="flex items-center justify-between mb-4 bg-gray-100 p-2 rounded">
        <div className="flex gap-2">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
            disabled={pageNumber >= (numPages || pageNumber)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        
        <select
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
        </select>
      </div>

      {/* PDF Container */}
      <div className="border rounded overflow-auto relative">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-8">Loading PDF...</div>}
          error={<div className="p-8 text-red-500">Failed to load PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            inputRef={pageRef}
            onLoadSuccess={handlePageLoadSuccess}
          >
            {/* Signature Placement Component */}
            {documentId && pageDimensions.width > 0 && (
              <SignaturePlacement
                documentId={documentId}
                pageNumber={pageNumber}
                pageDimensions={pageDimensions}
                onPlaceSignature={addSignaturePlaceholder}
                onSignComplete={(signatureData) => {
                  // Find the most recent signature (the one we just placed)
                  const lastSignature = signatures[signatures.length - 1];
                  if (lastSignature) {
                    signDocument(lastSignature._id, signatureData);
                  }
                }}
              />
            )}
          </Page>
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;