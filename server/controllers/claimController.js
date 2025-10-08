const Claim = require('../models/Claim');
const User = require('../models/User');
const ClaimTypeMaster = require('../models/ClaimTypeMaster');
const StatusMaster = require('../models/StatusMaster');
const ApprovalRule = require('../models/ApprovalRule');

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
    if (req.user.role === 'Manager') {
      // Get claims for users in the same team (not implemented, gets all for now)
      claims = await Claim.find()
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
      .populate('approvalHistory.approver', 'name email')
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
    const claim = await Claim.findById(req.params.id).populate('user', 'name email');
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
    console.log('claimType', claimType);
    console.log('amount', amount);

    // Validate claimType against ClaimTypeMaster
    const validClaimType = await ClaimTypeMaster.findById(claimType);
    if (!validClaimType) {
      return res.status(400).json({ success: false, message: 'Invalid Claim Type' });
    }

    // Get Pending status ID
    const pendingStatus = await StatusMaster.findOne({ statusName: 'Pending' });
    if (!pendingStatus) {
      return res.status(500).json({ success: false, message: 'Pending status not found. Please create it in StatusMaster.' });
    }

    // Find the approval rule for the claim
    const approvalRule = await ApprovalRule.findOne({
      claimType: validClaimType._id,
      amountMin: { $lte: amount },
      amountMax: { $gte: amount },
    });
    console.log('approvalRule', approvalRule);

    if (!approvalRule || approvalRule.approvers.length === 0) {
      return res.status(400).json({ success: false, message: 'No approval rule found for this claim type and amount.' });
    }

    const claimData = {
      user: user._id,
      claimId: generateClaimId(),
      claimType: validClaimType._id,
      amount,
      description,
      status: pendingStatus._id,
      approvalHistory: [],
    };

    if (req.file) {
      claimData.attachments = [req.file.path];
    }

    // Set the first approver
    const firstApprover = approvalRule.approvers[0];
    claimData.approvalHistory.push({
      approver: firstApprover.approverId,
      status: pendingStatus._id,
    });

    const claim = await Claim.create(claimData);
    res.status(201).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update claim
// @route   PUT /api/claims/:id
// @access  Private
exports.updateClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    // Make sure user is claim owner
    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this claim' });
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
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    // Make sure user is claim owner
    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this claim' });
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
      (approver) => approver.approverId.toString() === req.user.id
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
      const pendingStatus = await StatusMaster.findOne({ statusName: 'Pending' });
      claim.approvalHistory.push({
        approver: nextApprover.approverId,
        status: pendingStatus._id,
      });
    } else {
      claim.status = approvedStatus._id;
    }

    await claim.save();

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

    const rejectedStatus = await StatusMaster.findOne({ statusName: 'Rejected' });
    if (!rejectedStatus) {
      return res.status(500).json({ success: false, message: 'Rejected status not found.' });
    }

    claim.status = rejectedStatus._id;
    const currentApproverIndex = claim.approvalHistory.length - 1;
    claim.approvalHistory[currentApproverIndex].status = rejectedStatus._id;
    claim.approvalHistory[currentApproverIndex].remarks = req.body.remarks;


    await claim.save();

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

    const returnedStatus = await StatusMaster.findOne({ statusName: 'Returned' });
    if (!returnedStatus) {
      return res.status(500).json({ success: false, message: 'Returned status not found.' });
    }

    claim.status = returnedStatus._id;
    const currentApproverIndex = claim.approvalHistory.length - 1;
    claim.approvalHistory[currentApproverIndex].status = returnedStatus._id;
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

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

