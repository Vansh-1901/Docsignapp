import mongoose from 'mongoose';

const signedDocumentSchema = new mongoose.Schema({
  originalDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  signedUrl: {
    type: String,
    required: true
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SignedDocument', signedDocumentSchema);