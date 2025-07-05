// ✅ PDFViewer.jsx
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);

  if (!url) {
    return <div className="text-red-500">❌ No PDF URL provided</div>;
  }

  const handleLoadSuccess = ({ numPages }) => setNumPages(numPages);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      <Document
        file={url}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={(err) => console.error("PDF load error:", err.message)}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
