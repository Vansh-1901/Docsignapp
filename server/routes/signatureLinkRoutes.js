import express from 'express';
import { 
  createSignatureLink,
  verifyToken
} from '../controllers/signatureLinkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createSignatureLink);
router.get('/verify/:token', verifyToken);

export default router;