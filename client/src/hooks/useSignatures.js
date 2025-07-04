import { useState, useEffect } from "react";
import axios from '../services/api';

import React from 'react'

export const useSignatures = (documentId) => {
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSignatures = async () => {
        if(!documentId) return;
        try {
            setLoading(true);
            const {data} = await axios.get(`/signatures/document/${documentId}`);
            setSignatures(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch signatures');
        } finally {
            setLoading(false);
        }
    };

    const addSignaturePlaceholder = async (signatureData) => {
        try {
            const {data} = await axios.post('/signatures', signatureData);
            setSignatures(prev => [...prev, data]);
            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add signature');
            throw err;
        }
    };

    const signDocument = async (signatureId, signatureData) => {
        try {
            const {data} = await axios.put(`/signatures/${signatureId}/sign`, {signatureData});
            setSignatures(prev =>
                prev.map(sig =>
                    sig._id === signatureId ? {...sig, ...data} : sig
                )
            );
            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to sign document');
            throw err;
        }
    };

    useEffect(() => {
        fetchSignatures();
    }, [documentId]);

    return {
        signatures,
        loading,
        error,
        addSignaturePlaceholder,
        signDocument,
        fetchSignatures
    };
};

export default useSignatures;