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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClaimTypeMaster',
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
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StatusMaster',
    required: true,
  },
  approvalHistory: [
    {
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleMaster',
      },
      status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StatusMaster',
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
  reimbursed: {
    type: Boolean,
    default: false,
  },
  reimbursedDate: {
    type: Date,
  },
});

module.exports = mongoose.model('Claim', ClaimSchema);
