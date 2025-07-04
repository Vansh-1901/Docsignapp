import SignatureLink from '../models/SignatureLink.js';
import { generateToken, generateExpiryDate } from '../services/tokenService.js';
import { sendSignatureEmail } from '../services/emailService.js';

export const createSignatureLink = async (req, res) => {
  try {
    const { documentId, signatureId, email } = req.body;
    const userId = req.user.id;

    // Validate document ownership
    const document = await Document.findOne({ 
      _id: documentId, 
      owner: userId 
    });
    if (!document) {
      return res.status(403).json({ error: 'Document not found or access denied' });
    }

    // Create unique token
    const token = generateToken();
    const expiresAt = generateExpiryDate();

    // Store in database
    const signatureLink = await SignatureLink.create({
      document: documentId,
      signatureField: signatureId,
      token,
      expiresAt,
      sentTo: email
    });

    // Generate public URL
    const publicUrl = `${process.env.FRONTEND_URL}/sign/${token}`;
    
    // Send email
    await sendSignatureEmail(email, publicUrl);

    res.json({
      success: true,
      message: 'Signature link sent successfully',
      link: publicUrl // For testing purposes
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create signature link',
      details: error.message 
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await SignatureLink.findOne({ token })
      .populate('document')
      .populate('signatureField');

    if (!link) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    if (link.status === 'completed') {
      return res.json({ 
        valid: false,
        message: 'This link has already been used' 
      });
    }

    res.json({
      valid: true,
      document: link.document,
      signatureField: link.signatureField
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Token verification failed',
      details: error.message 
    });
  }
};

export const completeSignature = async (req, res) => {
  try {
    const { token } = req.params;
    const { signatureData } = req.body;

    // Find and validate link
    const link = await SignatureLink.findOne({ token });
    if (!link || link.status === 'completed') {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    // Update signature field
    await Signature.findByIdAndUpdate(link.signatureField, {
      status: 'signed',
      signatureData,
      signedAt: new Date()
    });

    // Mark link as used
    link.status = 'completed';
    await link.save();

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to complete signature',
      details: error.message 
    });
  }
};