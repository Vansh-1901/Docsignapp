import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
    addSignatureField,
    getDocumentSignatures,
    signDocument, updateSignaturePosition, finalizeSigning, applySignature,updateSignatureStatus
 } from '../controllers/signatureController.js';
import { logSignature } from '../middleware/auditMiddleware.js';
import { validateSignatureData } from '../middleware/ValidateSignatureData.js';

const router = express.Router();


//All routes require authentication
router.use(protect);
router.post('/fields', addSignatureField)
router.get('/document/:documentId', getDocumentSignatures);
router.put("/:signatureId", protect, updateSignaturePosition);
router.post('/:documentId/finalize',protect, finalizeSigning);
router.put('/:signatureId/sign', signDocument);
router.post('/:id/sign', protect, validateSignatureData, applySignature);
router.put('/:signatureId/apply', protect, logSignature, applySignature);
router.put('/:signatureId/satus', updateSignatureStatus)
router.put('/:id', 
  protect,
  async (req, res) => {
    try {
      const signature = await Signature.findByIdAndUpdate(
        req.params.id,
        {
          signatureData: req.body.signatureData,
          status: 'signed',
          signedAt: new Date()
        },
        { new: true }
      );
      res.json(signature);
    } catch (error) {
      res.status(500).json({ error: 'Signature update failed' });
    }
  }
);

export default router;