// server/routes/documentRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  getUserDocuments,
  getDocument,
  finalizeDocument,
} from "../controllers/documentController.js";
// import { logAction } from '../middleware/auditMiddleware.js'; // Optional if needed

const router = express.Router();

// Upload a new document
router.post("/upload", protect, upload.single("document"), uploadDocument);

// Get all documents uploaded by the authenticated user
router.get("/", protect, getUserDocuments);

// Get a specific document by ID
router.get("/:id", protect, getDocument);

// Finalize a document (e.g., apply signatures)
router.post("/:id/finalize", protect, finalizeDocument);

export default router;
