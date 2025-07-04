import { useState, useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import Draggable from 'react-draggable';
import SignatureField from './SignatureField';
import { usePDFEditor } from '../hooks/usePDFEditor';

const PDFEditor = ({ documentId, fileUrl }) => {
  const {
    numPages,
    pageNumber,
    scale,
    signatures,
    pageRef,
    pageDimensions,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    handleAddSignature,
    handleSignComplete,
    handlePageChange,
    handleScaleChange
  } = usePDFEditor(documentId);

  return (
    <div className="pdf-editor-container">
      <div className="controls">
        <button onClick={() => handlePageChange(-1)} disabled={pageNumber <= 1}>
          Previous
        </button>
        <span>Page {pageNumber} of {numPages}</span>
        <button onClick={() => handlePageChange(1)} disabled={pageNumber >= numPages}>
          Next
        </button>
        <select value={scale} onChange={(e) => handleScaleChange(parseFloat(e.target.value))}>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.5">150%</option>
        </select>
        <button onClick={handleAddSignature}>Add Signature Field</button>
      </div>

      <div className="pdf-container">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={800}
            inputRef={pageRef}
            onLoadSuccess={onPageLoadSuccess}
          >
            {signatures
              .filter(sig => sig.pageNumber === pageNumber)
              .map(signature => (
                <SignatureField
                  key={signature._id}
                  signature={signature}
                  pageDimensions={pageDimensions}
                  onSignComplete={handleSignComplete}
                />
              ))}
          </Page>
        </Document>
      </div>
    </div>
  );
};

export default PDFEditor;