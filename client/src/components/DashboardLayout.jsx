import { useState } from "react";
import StatusFilter from "./StatusFilter";
import DocumentCard from "./DocumentCard";
import PDFViewer from "./PDFViewer";

const DashboardLayout = ({ documents }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null); // ✅ new state

  const filteredDocuments = statusFilter
    ? documents.filter((doc) => doc.status === statusFilter)
    : documents;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h2 className="font-bold text-lg mb-4">Filters</h2>
            <StatusFilter
              currentFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document._id} onClick={() => setSelectedDoc(document)}>
                <DocumentCard document={document} />
              </div>
            ))}
          </div>

          {/* ✅ Preview Panel */}
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Preview</h3>
            <PDFViewer filename={selectedDoc?.filename} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
