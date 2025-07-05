// client/src/api.js
import axios from "axios";

// ✅ Set correct base URL — no trailing `/api` here
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

// ✅ Attach token if present
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Global 401 handler (redirect to login if unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

//
// ✅ AUTH APIs
//
export const registerUser = (userData) =>
  axios.post("/api/auth/register", userData);

export const loginUser = (credentials) =>
  axios.post("/api/auth/login", credentials);

export const getCurrentUser = () => axios.get("/api/auth/me");

//
// ✅ DOCUMENT APIs
//
export const fetchDocuments = () => axios.get("/api/docs");

export const uploadDocument = (formData) =>
  axios.post("/api/docs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDocument = (id) => axios.get(`/api/docs/${id}`);

//
// ✅ SIGNATURE APIs
//
export const createSignatureField = (data) =>
  axios.post("/api/signatures/fields", data);

export const applySignature = (signatureId, signatureData) =>
  axios.put(`/api/signatures/${signatureId}/apply`, { signatureData });

export const finalizeSigning = (documentId) =>
  axios.post(`/api/signatures/${documentId}/finalize`);

//
// ✅ PUBLIC SIGNATURE LINK APIs
//
export const createSignatureLink = (data) =>
  axios.post("/api/signatures/links", data);

export const verifySignatureToken = (token) =>
  axios.get(`/api/signatures/verify/${token}`);

export const completeSignature = (token, signatureData) =>
  axios.post(`/api/signatures/${token}/complete`, { signatureData });

export default axios;
