const mongoose = require('mongoose');

const ApprovalRuleSchema = new mongoose.Schema({
  claimType: {
    type: String,
    required: true,
  },
  amountThreshold: {
    type: Number,
    required: true,
  },
  approvers: [
    {
      type: String,
      enum: ['Manager', 'Finance Officer', 'Admin/Finance Head', 'System Admin'],
    },
  ],
});

module.exports = mongoose.model('ApprovalRule', ApprovalRuleSchema);
