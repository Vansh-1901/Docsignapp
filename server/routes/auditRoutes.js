import express from 'express';
import { 
  getDocumentAuditLog,
  exportAuditLog
} from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:documentId', protect, getDocumentAuditLog);
router.get('/:documentId/export', protect, exportAuditLog);

export default router;