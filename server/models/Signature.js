import mongoose from 'mongoose'

const signatureSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    pageNumber: {
        type: Number,
        required: true,
        min: 1
    },
    x: {
        type: Number, 
        required: true,
        min: 0,
        max: 100
    },
    y: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    width: {
        type: Number,
        default: 20
    },
    height: {
        type: Number,
        default: 20
    },
    signer: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'signed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    signedAt:{
        type: Date
    },
    status: {
    type: String,
    enum: ['pending', 'signed', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    required: function() { return this.status === 'rejected'; }
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }]
}, { 
    timestamps: true 
});


// Adding text index for searching
signatureSchema.index({status: 'text'});

const Signature = mongoose.model('signature', signatureSchema);

export default Signature;