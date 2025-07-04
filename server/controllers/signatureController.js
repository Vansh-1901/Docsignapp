import {PDFDocument} from 'pdf-lib';
import Signature from "../models/Signature.js";
import Document from "../models/Document.js";
import SignedDocument from '../models/SignedDocument.js';
import { generateSignedPdf } from '../services/pdfService.js';
import fs from 'fs';
import path from 'path';

//Add signature placeholder
export const addSignatureField = async (req,res) => {
    try {
        const {documentId, pageNumber, x, y, width, height} = req.body;
        const userId = req.user.id;
        const document = await Document.findOne({_id: documentId, owner: userId});
        if(!document) {
            return res.status(404).json({error: 'Document not found'});
        }
        const signature = await Signature.create({
            document: documentId,
            pageNumber,
            x,
            y,
            width,
            height,
            signer: userId,
            status: 'pending'
        });

        res.status(201).json(signature);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//Apply signature to pdf
export const applySignature = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    
    const { signatureId } = req.params;
    const { signatureData } = req.body; // Fixed typo
    const userId = req.user.id;

    // Input validation
    if (!signatureData?.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'Invalid signature data format' });
    }

    // Find signature
    const signature = await Signature.findOne({
      _id: signatureId,
      signer: userId,
      status: 'pending'
    }).populate('document').session(session);

    if (!signature) {
      return res.status(404).json({ error: 'Signature not found or already signed' });
    }

    // File operations
    const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
    const pdfPath = path.join(uploadsDir, signature.document.filename);
    
    let pdfBytes;
    try {
      pdfBytes = fs.readFileSync(pdfPath);
    } catch (err) {
      return res.status(404).json({ error: 'Original document not found' });
    }

    // PDF processing
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(signature.pageNumber - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Position validation
    const absX = (signature.x / 100) * pageWidth;
    const absY = pageHeight - ((signature.y / 100) * pageHeight);
    const absWidth = (signature.width / 100) * pageWidth;
    const absHeight = (signature.height / 100) * pageHeight;

    if (absX < 0 || absY - absHeight < 0 || absX + absWidth > pageWidth) {
      return res.status(400).json({ error: 'Invalid signature position' });
    }

    // Embed signature
    const image = await pdfDoc.embedPng(signatureData);
    page.drawImage(image, {
      x: absX,
      y: absY - absHeight,
      width: absWidth,
      height: absHeight,
      opacity: 0.9 // Optional: make signature slightly transparent
    });

    // Save new version
    const timestamp = Date.now();
    const newFilename = `signed_${timestamp}_${signature.document.filename}`;
    const modifiedBytes = await pdfDoc.save();
    
    fs.writeFileSync(path.join(uploadsDir, newFilename), modifiedBytes);

    // Update database
    signature.status = 'signed';
    signature.signatureData = signatureData;
    signature.signedAt = new Date();
    await signature.save({ session });

    // Update document status if all signatures are complete
    const pendingSignatures = await Signature.countDocuments({
      document: signature.document._id,
      status: 'pending'
    }).session(session);

    if (pendingSignatures === 0) {
      await Document.findByIdAndUpdate(
        signature.document._id,
        { status: 'completed' },
        { session }
      );
    }

    await session.commitTransaction();
    
    res.json({
      success: true,
      signedUrl: `/uploads/${newFilename}`,
      documentStatus: pendingSignatures === 0 ? 'completed' : 'pending_signatures'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Signature error:', error);
    res.status(500).json({ 
      error: 'Failed to apply signature',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

export const updateSignaturePosition = async (req, res) => {
  try {
    const { signatureId } = req.params;
    const { x, y } = req.body;
    const userId = req.user.id;

    console.log("Updating signature:", { signatureId, x, y }); // Debug log

    const signature = await Signature.findOneAndUpdate(
      { _id: signatureId, signer: userId },
      { x, y },
      { new: true }
    );

    if (!signature) {
      console.log("Signature not found or unauthorized"); // Debug log
      return res.status(404).json({ error: "Signature not found" });
    }

    console.log("Updated signature:", signature); // Debug log
    res.json({ success: true, updatedSignature: signature });
  } catch (error) {
    console.error("Update error:", error); // Debug log
    res.status(500).json({ error: error.message });
  }
};

export const updateSignatureStatus = async (req, res) => {
  try {
    const { signatureId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;

    // Validate status transition
    const validTransitions = {
      pending: ['signed', 'rejected'],
      signed: [],
      rejected: ['signed']
    };

    const signature = await Signature.findById(signatureId)
      .populate('document');

    if (!signature) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    // Check permission (document owner or assigned signer)
    const isOwner = signature.document.owner.equals(userId);
    const isSigner = signature.signer.equals(userId);
    
    if (!isOwner && !isSigner) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Validate status change
    if (!validTransitions[signature.status].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${signature.status} to ${status}`
      });
    }

    // Update signature
    signature.status = status;
    signature.rejectionReason = status === 'rejected' ? reason : undefined;
    
    // Add to history
    signature.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: userId,
      reason
    });

    await signature.save();

    res.json({
      success: true,
      signature: {
        id: signature._id,
        status: signature.status,
        updatedAt: signature.updatedAt
      }
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update signature status',
      details: error.message 
    });
  }
};

// get signatures for a document
export const getDocumentSignatures = async (req, res) => {
    try {
        const {documentId} =req.params;
        const userId = req.user.id;

        //verify document exists and belongs to user
        const document = await Document.findOne({_id: documentId, owner: userId});
        if(!document){
            return res.status(404).json({error: 'Document not found'});
        }
        const signatures = await Signature.find({document: documentId});
        res.json(signatures);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Update signature status to signed
export const signDocument =async (req, res) => {
    try {
        const {signatureId} = req.params;
        const userId = req.user.id;
        const signature = await Signature.findOneAndUpdate(
            {_id: signatureId, signer: userId},
            {status: 'signed', signedAt: new Date()},
            {new: true}
        );
        if(!signature) {
            return res.status(404).json({error: 'Signature not found'});
        }

        res.json(signature);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const finalizeSigning = async (req, res) => {
    console.log('Finalize request recieved for doc:', req.params.documentId);
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // 1. Get all signatures for this document
    const signatures = await Signature.find({ 
      document: documentId,
      status: 'signed' 
    }).populate('signer');

    // 2. Get original document
    const originalDoc = await Document.findById(documentId);
    if (!originalDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 3. Generate signed PDF
    const originalPath = path.join(__dirname, '../uploads', originalDoc.filename);
    const signedPath = await generateSignedPdf(originalPath, signatures);

    // 4. Create signed document record
    const signedDoc = await SignedDocument.create({
      originalDocument: documentId,
      signedUrl: `/uploads/${path.basename(signedPath)}`,
      signedBy: userId
    });

    res.json({
      success: true,
      signedUrl: signedDoc.signedUrl,
      downloadLink: `${req.protocol}://${req.get('host')}${signedDoc.signedUrl}`
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to finalize document',
      details: error.message 
    });
  }
};

// Add this new method
export const finalizeDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    
    // Verify all signatures are complete
    const incomplete = await Signature.exists({
      document: document._id,
      status: { $ne: 'signed' }
    });
    
    if (incomplete) {
      return res.status(400).json({ error: 'Pending signatures remaining' });
    }

    // Merge signatures into final PDF (pseudo-code)
    const finalPdf = await mergeSignatures(document);
    
    // Update document status
    document.status = 'finalized';
    document.finalPath = `/finalized/${document._id}.pdf`;
    await document.save();

    res.json({
      success: true,
      downloadUrl: document.finalPath
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Finalization failed' });
  }
};