// src/pages/UploadRedirect.jsx

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const UploadRedirect = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      // Redirect to the document view page
      window.location.replace(`/documents/${id}`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      <p>📄 Redirecting to your uploaded document...</p>
    </div>
  );
};

export default UploadRedirect;
