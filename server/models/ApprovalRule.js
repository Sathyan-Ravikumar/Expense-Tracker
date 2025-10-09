const mongoose = require('mongoose');

const ApproverSchema = new mongoose.Schema({
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoleMaster',
  },
  level: {
    type: Number,
    required: true,
  },
});

const ApprovalRuleSchema = new mongoose.Schema({
  claimType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClaimTypeMaster',
    required: true,
  },
  amountMin: {
    type: Number,
    default: 0,
  },
  amountMax: {
    type: Number,
    default: Infinity,
  },
  approvers: [ApproverSchema],
});

module.exports = mongoose.model('ApprovalRule', ApprovalRuleSchema);