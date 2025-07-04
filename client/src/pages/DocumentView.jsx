import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page } from "react-pdf";
import axios from "../services/api";
import { toast } from "react-hot-toast";
import AuditLog from "../components/AuditLog";
import SignatureField from "../components/SignatureField";
import UploadButton from "../components/UploadButton";

const DocumentView = () => {
  const { id: documentId } = useParams(); // fixed: match route param
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const pageRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docResponse, sigsResponse] = await Promise.all([
          axios.get(`/docs/${documentId}`),
          axios.get(`/signatures/document/${documentId}`),
        ]);
        setDocument(docResponse.data);
        setSignatures(sigsResponse.data);

        await axios.post(`/audit/log`, {
          documentId,
          action: "view",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load document");
        if (err.response?.status === 404) {
          navigate("/dashboard", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId, navigate]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setPdfError("Failed to load PDF document");
  };

  const handlePageLoadSuccess = () => {
    if (pageRef.current) {
      const { width, height } = pageRef.current.getBoundingClientRect();
      setPageDimensions({ width, height });
    }
  };

  const handlePageChange = (offset) => {
    setPageNumber((prev) =>
      Math.max(1, Math.min(numPages || 1, prev + offset))
    );
  };

  const handleFinalize = async () => {
    try {
      const { data } = await axios.post(`/docs/${documentId}/finalize`);
      if (data.success) {
        toast.success("Document finalized!");
        setDocument((prev) => ({
          ...prev,
          status: "finalized",
          finalUrl: data.downloadUrl,
        }));
      }
    } catch (error) {
      toast.error("Failed to finalize document");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading document...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!document)
    return <div className="text-center py-8">Document not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{document.originalname}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded text-sm ${
                document.status === "signed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {document.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(document.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <UploadButton onUploadSuccess={() => window.location.reload()} />
          {document.status === "signed" && (
            <button
              onClick={handleFinalize}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Finalize Document
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {pageNumber} of {numPages || "--"}
            </span>
            <button
              onClick={() => handlePageChange(1)}
              disabled={pageNumber >= (numPages || 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden relative">
            {pdfError ? (
              <div className="p-8 text-red-500">{pdfError}</div>
            ) : (
              <Document
                file={`${import.meta.env.VITE_API_BASE_URL}${document.path}`}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="p-8">Loading PDF...</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  width={800}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  inputRef={pageRef}
                  onLoadSuccess={handlePageLoadSuccess}
                />
                {signatures
                  .filter((sig) => sig.pageNumber === pageNumber)
                  .map((signature) => (
                    <SignatureField
                      key={signature._id}
                      signature={signature}
                      pageDimensions={pageDimensions}
                      onSignComplete={async (signatureData) => {
                        try {
                          await axios.put(
                            `/signatures/${signature._id}/apply`,
                            {
                              signatureData,
                            }
                          );
                          setSignatures((prev) =>
                            prev.map((s) =>
                              s._id === signature._id
                                ? { ...s, status: "signed", signatureData }
                                : s
                            )
                          );
                          toast.success("Signature applied successfully");
                        } catch (error) {
                          toast.error("Failed to apply signature");
                        }
                      }}
                    />
                  ))}
              </Document>
            )}
          </div>
        </div>

        <div className="md:w-1/3">
          <AuditLog documentId={documentId} />
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
