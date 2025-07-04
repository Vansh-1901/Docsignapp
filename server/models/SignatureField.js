import mongoose from 'mongoose';

const signatureFieldSchema = new mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    fields: [{
        page: Number,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        required: Boolean,
        signedAt: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const SignatureField = mongoose.model('SignatureField', signatureFieldSchema);

export default SignatureField;