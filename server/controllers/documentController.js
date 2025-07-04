import Document from "../models/Document.js";
import { protect } from "../middleware/auth.js";

//Upload PDF document
export const uploadDocument = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({success: false, error: 'No file uploaded'});
        }

        const document = await Document.create({
            filename: req.file.filename,
            path: req.file.path,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            owner: req.user.id,
            status: 'uploaded'
        });

        //Create default signature fields 
        if(req.body.signatureFields) {
            await SignatureField.create({
                document: document._id,
                fields: req.body.signatureFields,
                createdBy: req.user.id
            });
        }

        res.status(201).json({
            success: true,
            _id: document._id.toString(),
            originalname: document.originalname,
            nextStep: `/documents/${document._id}/sign`
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error during upload',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's documents
export const getUserDocuments = async (req, res) => {
    try {
        const {status} = req.query;
        const filter = {owner: req.user.id};

        if(status) {
            filter.status = status;
        }
        const documents = await Document.find({owner: req.user.id})
            .sort({uploadedAt: -1})
            .lean();

    //      const enhancedDocs = documents.map(doc => ({
    //   ...doc,
    //   status: doc.status || 'pending' // Default status
    // }));
    
    
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching documents'
        });
    }
};

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('signatures');

    if (!document) {
      return res.status(404).json({ 
        success: false,
        error: 'Document not found' 
        });
    }

    res.status(200).json({
        success: true,
        data:document
    });
  } catch (error) {
    //console.error('Get document error:', error);
    res.status(500).json({ 
        success: false,
        error: 'Failed to fetch document' 
    });
  }
};

// In documentController.js
export const finalizeDocument = async (req, res) => {
  try {
    // 1. Verify all signatures are complete
    const incomplete = await Signature.exists({
      document: req.params.id,
      status: { $ne: 'signed' }
    });
    
    if (incomplete) {
      return res.status(400).json({ 
        success: false,
        message: 'Pending signatures remain' 
      });
    }

    // 2. Generate final PDF (your implementation)
    const finalUrl = await generateFinalPdf(req.params.id);
    
    // 3. Update document
    await Document.findByIdAndUpdate(req.params.id, {
      status: 'finalized',
      finalUrl
    });

    res.json({ 
      success: true,
      downloadUrl: finalUrl
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Finalization failed'
    });
  }
};