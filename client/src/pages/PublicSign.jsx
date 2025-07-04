import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../services/api";
import SignatureCanvas from "../components/SignatureCanvas";

const PublicSign = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [signatureField, setSignatureField] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.get(`/signature-links/verify/${token}`);
        if (data.valid) {
          setDocument(data.document);
          setSignatureField(data.signatureField);
        } else {
          setError(data.message || "Invalid signature link");
        }
      } catch (err) {
        setError("Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (signatureData) => {
    try {
      await axios.post(`/signature-links/${token}/complete`, { signatureData });
      setSuccess(true);
    } catch (error) {
      console.error("Signature submission failed:", error);
      alert("Failed to submit signature. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-8">Verifying link...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;
  if (success) {
    return (
      <div className="text-center text-green-600 py-8">
        ✅ Thank you! Your signature was submitted successfully.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Sign Document:{" "}
        <span className="text-blue-700">{document?.originalname}</span>
      </h1>

      <div className="mb-6 text-gray-700">
        <p>You've been invited to sign this document.</p>
        <p>Please sign below to complete your part.</p>
      </div>

      <SignatureCanvas
        onSave={handleSubmit}
        fieldLabel={signatureField?.label || "Signature"}
      />
    </div>
  );
};

export default PublicSign;
