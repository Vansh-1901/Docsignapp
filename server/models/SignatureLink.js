import mongoose from 'mongoose';

const signatureLinkSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  signatureField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signature',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  sentTo: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email!`
    }
  }
}, { timestamps: true });

// Index for faster token lookup
signatureLinkSchema.index({ token: 1 });
signatureLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SignatureLink', signatureLinkSchema);