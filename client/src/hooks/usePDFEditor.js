import { useState, useRef, useEffect } from 'react';
import axios from '../services/api';

export const usePDFEditor = (documentId) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signatures, setSignatures] = useState([]);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const pageRef = useRef(null);

  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        const { data } = await axios.get(`/signatures/document/${documentId}`);
        setSignatures(data);
      } catch (error) {
        console.error('Error fetching signatures:', error);
      }
    };

    if (documentId) fetchSignatures();
  }, [documentId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = () => {
    if (pageRef.current) {
      const { width, height } = pageRef.current.getBoundingClientRect();
      setPageDimensions({ width, height });
    }
  };

  const handlePageChange = (offset) => {
    setPageNumber(prev => Math.max(1, Math.min(numPages, prev + offset)));
  };

  const handleScaleChange = (newScale) => {
    setScale(newScale);
  };

  const handleAddSignature = async () => {
    try {
      const { data } = await axios.post('/signatures/fields', {
        documentId,
        pageNumber,
        x: 50, // Default center position
        y: 50,
        width: 20,
        height: 10
      });
      setSignatures(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding signature field:', error);
    }
  };

  const handleSignComplete = async (signatureId, signatureData) => {
    try {
      const { data } = await axios.put(`/signatures/${signatureId}/apply`, { signatureData });
      setSignatures(prev => 
        prev.map(sig => 
          sig._id === signatureId ? { ...sig, ...data } : sig
        )
      );
    } catch (error) {
      console.error('Error applying signature:', error);
    }
  };

  return {
    numPages,
    pageNumber,
    scale,
    signatures,
    pageRef,
    pageDimensions,
    onDocumentLoadSuccess,
    onPageLoadSuccess,
    handleAddSignature,
    handleSignComplete,
    handlePageChange,
    handleScaleChange
  };
};