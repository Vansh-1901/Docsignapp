import { Link } from "react-router-dom";

const DocumentCard = ({ document }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    signed: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg truncate">
            {document.originalname}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(document.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[document.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {document.status}
        </span>
      </div>

      <div className="mt-4 flex space-x-2">
        <Link
          to={`/documents/${document._id}`}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          View
        </Link>
        {document.status === "pending" && (
          <button className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200">
            Remind
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
