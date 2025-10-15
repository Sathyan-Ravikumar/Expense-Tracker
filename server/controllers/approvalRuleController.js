const ApprovalRule = require('../models/ApprovalRule');
const Notification = require('../models/Notification');
const User = require('../models/User');
const RoleMaster = require('../models/RoleMaster');

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
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `A new approval rule has been created by ${req.user.name}.`,
            });
        }
    }

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
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `An approval rule has been updated by ${req.user.name}.`,
            });
        }
    }

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
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `An approval rule has been deleted by ${req.user.name}.`,
            });
        }
    }

    await approvalRule.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
