const DashboardLayout = ({ documents }) => {
  const [statusFilter, setStatusFilter] = useState("");

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
              <DocumentCard key={document._id} document={document} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
