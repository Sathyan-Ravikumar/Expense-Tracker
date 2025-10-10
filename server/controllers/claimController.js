const Claim = require('../models/Claim');
const User = require('../models/User');
const ClaimTypeMaster = require('../models/ClaimTypeMaster');
const StatusMaster = require('../models/StatusMaster');
const ApprovalRule = require('../models/ApprovalRule');
const RoleMaster = require('../models/RoleMaster');
const Notification = require('../models/Notification');

// Function to generate a unique claim ID
const generateClaimId = () => {
  return 'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private/Approver
exports.getClaims = async (req, res, next) => {
  try {
    let claims;
    if (req.user.role.roleName === 'Manager') {
      // Find users who report to the current manager
      const employees = await User.find({ manager: req.user.id });
      const employeeIds = employees.map((employee) => employee._id);

      // Include manager's own claims as well
      const userIds = [req.user.id, ...employeeIds];

      claims = await Claim.find({ user: { $in: userIds } })
        .populate('user', 'name email')
        .populate('claimType', 'typeName')
        .populate('status', 'statusName');
    } else {
      claims = await Claim.find()
        .populate('user', 'name email')
        .populate('claimType', 'typeName')
        .populate('status', 'statusName');
    }
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all claims for logged in user
// @route   GET /api/claims/my
// @access  Private
exports.getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('claimType', 'typeName')
      .populate('status', 'statusName')
      .populate('approvalHistory.status', 'statusName');
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all claims for an approver
// @route   GET /api/claims/approver
// @access  Private/Approver
exports.getClaimsForApprover = async (req, res, next) => {
  try {
    const pendingStatus = await StatusMaster.findOne({ statusName: 'Pending' });
    if (!pendingStatus) {
      return res.status(500).json({ success: false, message: 'Pending status not found.' });
    }

    const claims = await Claim.find({
      "approvalHistory.approver": req.user.id,
      "approvalHistory.status": pendingStatus._id,
    })
      .populate('user', 'name email')
      .populate('claimType', 'typeName')
      .populate('status', 'statusName');

    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single claim
// @route   GET /api/claims/:id
// @access  Private
exports.getClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('user', 'name email').populate('claimType');
    if (!claim) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create claim
// @route   POST /api/claims
// @access  Private
exports.createClaim = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { claimType, amount, description } = req.body;

    const validClaimType = await ClaimTypeMaster.findById(claimType);
    if (!validClaimType) {
      return res.status(400).json({ success: false, message: 'Invalid Claim Type' });
    }

    const approvalRule = await ApprovalRule.findOne({
      claimType: validClaimType._id,
      amountMin: { $lte: amount },
      amountMax: { $gte: amount },
    });

    if (!approvalRule || approvalRule.approvers.length === 0) {
      return res.status(400).json({ success: false, message: 'No approval rule found for this claim type and amount.' });
    }
    
    const pendingStatus = await StatusMaster.findOne({ statusName: 'Pending' });
    if (!pendingStatus) {
      return res.status(500).json({ success: false, message: 'Generic Pending status not found.' });
    }

    // Determine the starting approver based on who is submitting
    let firstApprover;
    const submitterRole = req.user.role;
    const submitterIndex = approvalRule.approvers.findIndex(
        a => a.approverId.toString() === submitterRole._id.toString()
    );

    if (submitterIndex > -1 && submitterIndex < approvalRule.approvers.length - 1) {
        // If submitter is in the chain, start with the next person
        firstApprover = approvalRule.approvers[submitterIndex + 1];
    } else {
        // Otherwise, start from the beginning (for employees or those not in the chain)
        firstApprover = approvalRule.approvers[0];
    }

    // Determine the specific pending status
    let statusId = pendingStatus._id; // Default to generic pending
    const firstApproverRole = await RoleMaster.findById(firstApprover.approverId);

    if (firstApproverRole) {
      const newStatusName = `Pending: ${firstApproverRole.roleName}`;
      const newStatus = await StatusMaster.findOne({ statusName: newStatusName });
      if (newStatus) {
        statusId = newStatus._id; // Use specific status if found
      }
    }

    const claimData = {
      user: user._id,
      claimId: generateClaimId(),
      claimType: validClaimType._id,
      amount,
      description,
      status: statusId,
      approvalHistory: [],
    };

    if (req.file) {
      claimData.attachments = [req.file.path];
    }

    claimData.approvalHistory.push({
      approver: firstApprover.approverId,
      status: pendingStatus._id,
    });

    const claim = await Claim.create(claimData);
    res.status(201).json({ success: true, data: claim });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
exports.updateClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id).populate('approvalHistory.status').populate('status');

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    // Make sure user is claim owner
    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this claim' });
    }

    // Allow editing if claim is returned, otherwise block if it has any approvals.
    if (claim.status.statusName !== 'Returned') {
        const hasBeenApproved = claim.approvalHistory.some(
            (history) => history.status.statusName === 'Approved'
        );
        if (hasBeenApproved) {
            return res.status(400).json({ success: false, message: 'Cannot edit a claim that is already in the approval process.' });
        }
    }

    claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete claim
// @route   DELETE /api/claims/:id
// @access  Private
exports.deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('approvalHistory.status').populate('status');

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    // Make sure user is claim owner
    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this claim' });
    }

    // Allow deleting if claim is returned, otherwise block if it has any approvals.
    if (claim.status.statusName !== 'Returned') {
        const hasBeenApproved = claim.approvalHistory.some(
            (history) => history.status.statusName === 'Approved'
        );
        if (hasBeenApproved) {
            return res.status(400).json({ success: false, message: 'Cannot delete a claim that is already in the approval process.' });
        }
    }

    await claim.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Approve claim
// @route   PUT /api/claims/:id/approve
// @access  Private/Approver
exports.approveClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    const approvalRule = await ApprovalRule.findOne({
      claimType: claim.claimType,
      amountMin: { $lte: claim.amount },
      amountMax: { $gte: claim.amount },
    });

    if (!approvalRule) {
      return res.status(400).json({ success: false, message: 'No approval rule found for this claim type and amount.' });
    }

    const currentApproverIndex = approvalRule.approvers.findIndex(
      (approver) => approver.approverId.toString() === req.user.role._id.toString()
    );

    if (currentApproverIndex === -1) {
      return res.status(401).json({ success: false, message: 'Not authorized to approve this claim' });
    }

    const approvedStatus = await StatusMaster.findOne({ statusName: 'Approved' });
    if (!approvedStatus) {
      return res.status(500).json({ success: false, message: 'Approved status not found.' });
    }

    claim.approvalHistory[currentApproverIndex].status = approvedStatus._id;
    claim.approvalHistory[currentApproverIndex].remarks = req.body.remarks;

    const nextApprover = approvalRule.approvers[currentApproverIndex + 1];

    if (nextApprover) {
      const nextApproverRole = await RoleMaster.findById(nextApprover.approverId);
      const newStatusName = `Pending: ${nextApproverRole.roleName}`;
      const newStatus = await StatusMaster.findOne({ statusName: newStatusName });
      
      const pendingStatus = await StatusMaster.findOne({ statusName: 'Pending' });

      if (newStatus) {
        claim.status = newStatus._id;
      } else {
        claim.status = pendingStatus._id; // Fallback to generic pending
      }

      claim.approvalHistory.push({
        approver: nextApprover.approverId,
        status: pendingStatus._id, // History entry remains generic pending
      });
    await claim.save();

    // Create notification for the user
    const finalStatus = await StatusMaster.findById(claim.status);
    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been updated to ${finalStatus.statusName}.`,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject claim
// @route   PUT /api/claims/:id/reject
// @access  Private/Approver
exports.rejectClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    const approvalRule = await ApprovalRule.findOne({
      claimType: claim.claimType,
      amountMin: { $lte: claim.amount },
      amountMax: { $gte: claim.amount },
    });

    if (!approvalRule) {
      return res.status(400).json({ success: false, message: 'No approval rule found for this claim type and amount.' });
    }

    const currentApproverIndex = approvalRule.approvers.findIndex(
      (approver) => approver.approverId.toString() === req.user.role._id.toString()
    );

    if (currentApproverIndex === -1) {
      return res.status(401).json({ success: false, message: 'Not authorized to reject this claim' });
    }

    const rejectedStatus = await StatusMaster.findOne({ statusName: 'Rejected' });
    if (!rejectedStatus) {
      return res.status(500).json({ success: false, message: 'Rejected status not found.' });
    }

    await claim.save();

    // Create notification for the user
    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been Rejected.`,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Return claim
// @route   PUT /api/claims/:id/return
// @access  Private/Approver
exports.returnClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    const approvalRule = await ApprovalRule.findOne({
      claimType: claim.claimType,
      amountMin: { $lte: claim.amount },
      amountMax: { $gte: claim.amount },
    });

    if (!approvalRule) {
      return res.status(400).json({ success: false, message: 'No approval rule found for this claim type and amount.' });
    }

    const currentApproverIndex = approvalRule.approvers.findIndex(
      (approver) => approver.approverId.toString() === req.user.role._id.toString()
    );

    if (currentApproverIndex === -1) {
      return res.status(401).json({ success: false, message: 'Not authorized to return this claim' });
    }

    const returnedStatus = await StatusMaster.findOne({ statusName: 'Returned' });
    if (!returnedStatus) {
      return res.status(500).json({ success: false, message: 'Returned status not found.' });
    }

    claim.status = returnedStatus._id;
    const currentHistoryIndex = claim.approvalHistory.length - 1;
    await claim.save();

    // Create notification for the user
    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been Returned for more information.`,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reimburse claim
// @route   PUT /api/claims/:id/reimburse
// @access  Private/Finance
exports.reimburseClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    const approvedStatus = await StatusMaster.findOne({ statusName: 'Approved' });
    if (!approvedStatus) {
      return res.status(500).json({ success: false, message: 'Approved status not found.' });
    }

    if (claim.status.toString() !== approvedStatus._id.toString()) {
      return res.status(400).json({ success: false, message: 'Claim must be approved before it can be reimbursed.' });
    }

    claim.reimbursed = true;
    claim.reimbursedDate = Date.now();

    await claim.save();

    // Create notification for the user
    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been Reimbursed.`,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};