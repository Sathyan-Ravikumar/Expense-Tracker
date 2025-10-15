const mongoose = require('mongoose');

const SystemAdminNotificationSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'approval_rule_created',
      'approval_rule_updated',
      'approval_rule_deleted',
    ],
  },
  affectedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  affectedRule: {
    type: mongoose.Schema.ObjectId,
    ref: 'ApprovalRule',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'SystemAdminNotification',
  SystemAdminNotificationSchema
);
