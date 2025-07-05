import React, { useState, useEffect } from "react";
import PDFViewer from "./PDFViewer";
import { fetchDocuments } from "../api";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const { data } = await fetchDocuments();
        setDocuments(data.data || data); // fallback for older responses
      } catch (err) {
        setError("Failed to load documents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Document List */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className={`p-3 rounded cursor-pointer hover:bg-gray-100 
                  ${
                    selectedDoc?._id === doc._id
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate font-medium">
                    {doc.originalname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(doc.size / 1024).toFixed(2)} KB
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PDF Preview */}
      <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        {selectedDoc ? (
          <PDFViewer
            url={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
              selectedDoc.filename
            }`}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
            <p className="text-gray-500">Select a document to preview</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
