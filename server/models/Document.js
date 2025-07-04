import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  size: Number,
  mimetype: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },
  status: {
    type: String,
    enum: ['uploaded','pending', 'awaiting_signatures', 'signed', 'finalized'],
    default: 'pending'
  },
  signatures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signature'
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;


// import mongoose from 'mongoose';

// const documentSchema = new mongoose.Schema({
//     filename: {
//         type: String,
//         required: true
//     },
//     path: {
//         type: String,
//         required: true
//     },
//     originalname: {
//         type: String,
//         required: true
//     },
//     size: {
//         type: String,
//         required: true
//     },
//     mimetype: {
//         type: String,
//         required: true
//     },
//     owner: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'awaiting_signatures', 'signed', 'finalized'],
//         default: 'pending'
//     },
//     signatures: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Signature'
//     }],
//     uploadedAt: {
//         type: Date,
//         default: Date.now
//     }
// },{
//     timestamps: true
// });

// const Document = mongoose.model('Document', documentSchema);

// export default Document;