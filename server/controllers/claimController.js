const Claim = require('../models/Claim');
const User = require('../models/User');

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private/Approver
exports.getClaims = async (req, res, next) => {
  try {
    let claims;
    if (req.user.role === 'Manager') {
      // Get claims for users in the same team (not implemented, gets all for now)
      claims = await Claim.find().populate('user', 'name email');
    } else {
      claims = await Claim.find().populate('user', 'name email');
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
      .populate('currentApprover', 'name email')
      .populate('approvalHistory.approver', 'name email');
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all claims for a manager
// @route   GET /api/claims/manager
// @access  Private/Manager
exports.getManagerClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ currentApprover: req.user.id })
      .populate('user', 'name email');
    res.status(200).json({ success: true, data: claims });
  } catch (err) {
    res.status(400).json({ success: false });
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

    const claimData = { ...req.body, user: user._id };

    if (req.file) {
      claimData.attachments = [req.file.path];
    }

    if (user.manager) {
      claimData.currentApprover = user.manager;
      claimData.approvalHistory = [
        { status: 'Pending', approver: user.manager },
      ];
    } else {
        // Handle case where user has no manager, maybe auto-approve or assign to a default admin
        claimData.approvalHistory = [{ status: 'Approved' }];
    }

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

    // Update status and history
    claim.status = 'Approved';
    claim.history.push({ status: 'Approved', changedBy: req.user.id, remarks: req.body.remarks });

    await claim.save();

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false });
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

    // Update status and history
    claim.status = 'Rejected';
    claim.history.push({ status: 'Rejected', changedBy: req.user.id, remarks: req.body.remarks });

    await claim.save();

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false });
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

    // Update status and history
    claim.status = 'Returned';
    claim.history.push({ status: 'Returned', changedBy: req.user.id, remarks: req.body.remarks });

    await claim.save();

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
