import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

// Add token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

// API ENDPOINTS
export const registerUser = (userData) =>
  axios.post("/api/auth/register", userData);

export const loginUser = (credentials) =>
  axios.post("/api/auth/login", credentials);

export const fetchDocuments = () => axios.get("/api/docs");

export const uploadDocument = (formData) =>
  axios.post("/api/docs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDocument = (id) => axios.get(`/api/docs/${id}`);

export const createSignatureField = (data) =>
  axios.post("/api/signatures/fields", data);

export const applySignature = (signatureId, signatureData) =>
  axios.put(`/api/signatures/${signatureId}/apply`, { signatureData });

export const finalizeSigning = (documentId) =>
  axios.post(`/api/signatures/${documentId}/finalize`);

export const createSignatureLink = (data) =>
  axios.post("/api/signature-links", data);

export const verifySignatureToken = (token) =>
  axios.get(`/api/signature-links/verify/${token}`);

export const completeSignature = (token, signatureData) =>
  axios.post(`/api/signature-links/${token}/complete`, { signatureData });

export default axios;
