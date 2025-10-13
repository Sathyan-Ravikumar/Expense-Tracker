const ApprovalRule = require('../models/ApprovalRule');
const SystemAdminNotification = require('../models/SystemAdminNotification');

// @desc    Get all approval rules
// @route   GET /api/approval-rules
// @access  Private/Admin
exports.getApprovalRules = async (req, res, next) => {
  try {
    const approvalRules = await ApprovalRule.find().populate('claimType', 'typeName').populate('approvers.approverId', 'name email');
    res.status(200).json({ success: true, data: approvalRules });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create approval rule
// @route   POST /api/approval-rules
// @access  Private/Admin
exports.createApprovalRule = async (req, res, next) => {
  try {
    const approvalRule = await ApprovalRule.create(req.body);

    // Create a notification for the System Admin
    await SystemAdminNotification.create({
      admin: req.user.id,
      action: 'approval_rule_created',
      affectedRule: approvalRule._id,
    });

    res.status(201).json({ success: true, data: approvalRule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update approval rule
// @route   PUT /api/approval-rules/:id
// @access  Private/Admin
exports.updateApprovalRule = async (req, res, next) => {
  try {
    let approvalRule = await ApprovalRule.findById(req.params.id);

    if (!approvalRule) {
      return res.status(404).json({ success: false });
    }

    approvalRule = await ApprovalRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Create a notification for the System Admin
    await SystemAdminNotification.create({
      admin: req.user.id,
      action: 'approval_rule_updated',
      affectedRule: approvalRule._id,
    });

    res.status(200).json({ success: true, data: approvalRule });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete approval rule
// @route   DELETE /api/approval-rules/:id
// @access  Private/Admin
exports.deleteApprovalRule = async (req, res, next) => {
  try {
    const approvalRule = await ApprovalRule.findById(req.params.id);

    if (!approvalRule) {
      return res.status(404).json({ success: false });
    }

    // Create a notification for the System Admin
    await SystemAdminNotification.create({
      admin: req.user.id,
      action: 'approval_rule_deleted',
      affectedRule: approvalRule._id,
    });

    await approvalRule.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
