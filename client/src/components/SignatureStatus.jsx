import { useState } from "react";
import axios from "../api";

const SignatureStatus = ({ signature, documentOwnerId, currentUserId }) => {
  const [status, setStatus] = useState(signature.status);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSigner = signature.signer === currentUserId;
  const isOwner = documentOwnerId === currentUserId;
  const canUpdate = isSigner || (isOwner && status === "rejected");

  const handleStatusChange = async (newStatus) => {
    if (!canUpdate) return;

    setIsLoading(true);
    try {
      const { data } = await axios.put(`/signatures/${signature._id}/status`, {
        status: newStatus,
        reason: newStatus === "rejected" ? reason : undefined,
      });
      setStatus(data.signature.status);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-medium ${
            status === "signed"
              ? "text-green-600"
              : status === "rejected"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {status.toUpperCase()}
        </span>

        {canUpdate && status === "pending" && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange("signed")}
              disabled={isLoading}
              className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:opacity-50"
            >
              {isLoading ? "Signing..." : "Sign"}
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              disabled={isLoading || !reason.trim()}
              className="px-3 py-1 bg-red-100 text-red-800 rounded disabled:opacity-50"
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </button>
          </div>
        )}

        {isOwner && status === "rejected" && (
          <button
            onClick={() => handleStatusChange("signed")}
            disabled={isLoading}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:opacity-50"
          >
            {isLoading ? "Approving..." : "Approve Anyway"}
          </button>
        )}
      </div>

      {status === "rejected" && (
        <div className="text-sm text-gray-600">
          <p>Reason: {signature.rejectionReason || "No reason provided"}</p>
        </div>
      )}

      {status === "pending" && canUpdate && (
        <div className="mt-2">
          <textarea
            placeholder="Reason for rejection (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            rows={2}
          />
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>Status History:</p>
        <ul className="list-disc pl-5">
          {signature.statusHistory?.map((entry, index) => (
            <li key={index}>
              {new Date(entry.changedAt).toLocaleString()} - {entry.status}
              {entry.reason && ` (${entry.reason})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SignatureStatus;
