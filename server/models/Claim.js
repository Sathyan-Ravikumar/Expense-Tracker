const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimId: {
    type: String,
    unique: true,
  },
  claimType: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  nextApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalHistory: [
    {
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Returned'],
      },
      remarks: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  attachments: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('Claim', ClaimSchema);
