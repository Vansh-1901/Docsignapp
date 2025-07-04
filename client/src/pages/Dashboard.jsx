// client/src/pages/Dashboard.jsx

import React from "react";
import DocumentList from "../components/DocumentList";
import UploadButton from "../components/UploadButton";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            Digi Sign Dashboard
          </h1>
        </div>
        <UploadButton />
        <div className="mt-6">
          <DocumentList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
