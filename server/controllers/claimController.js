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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let baseQuery = {};

    if (req.user.role.roleName === 'Manager') {
      const employees = await User.find({ manager: req.user.id });
      const employeeIds = employees.map((employee) => employee._id);
      const userIds = [req.user.id, ...employeeIds];
      baseQuery = { user: { $in: userIds } };
    } else {
      const userRoleId = req.user.role._id;
      const relevantRules = await ApprovalRule.find({ 'approvers.approverId': userRoleId });
      const relevantClaimTypeIds = [...new Set(relevantRules.map(rule => rule.claimType.toString()))];
      baseQuery = { claimType: { $in: relevantClaimTypeIds } };
    }

    // Add claimType filter if provided
    if (req.query.claimType) {
        baseQuery.claimType = req.query.claimType;
    }

    // Add amount range filter if provided
    if (req.query.minAmount) {
        baseQuery.amount = { ...baseQuery.amount, $gte: parseFloat(req.query.minAmount) };
    }
    if (req.query.maxAmount) {
        baseQuery.amount = { ...baseQuery.amount, $lte: parseFloat(req.query.maxAmount) };
    }

    // Add employee name filter if provided
    if (req.query.searchTerm) {
        const users = await User.find({ name: { $regex: req.query.searchTerm, $options: 'i' } });
        const userIds = users.map(u => u._id);
        
        baseQuery.$or = [
            { user: { $in: userIds } },
            { claimId: { $regex: req.query.searchTerm, $options: 'i' } }
        ];
    }

    // Add date range filter if provided
    if (req.query.startDate) {
        baseQuery.date = { ...baseQuery.date, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        baseQuery.date = { ...baseQuery.date, $lte: endDate };
    }

    const total = await Claim.countDocuments(baseQuery);
    const claims = await Claim.find(baseQuery).sort({ createdAt: -1 }).skip(startIndex).limit(limit)
      .populate('user', 'name email')
      .populate('claimType', 'typeName')
      .populate('status', 'statusName')
      .populate({
        path: 'approvalHistory.approver',
        select: 'name email'
      });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page,
        limit,
        total,
        totalPages,
    };
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({ success: true, count: claims.length, pagination, data: claims });

  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all claims for logged in user
// @route   GET /api/claims/my
// @access  Private
exports.getMyClaims = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query = { user: req.user.id };

    // Add claimType filter if provided
    if (req.query.claimType) {
        query.claimType = req.query.claimType;
    }

    // Add amount range filter if provided
    if (req.query.minAmount) {
        query.amount = { ...query.amount, $gte: parseFloat(req.query.minAmount) };
    }
    if (req.query.maxAmount) {
        query.amount = { ...query.amount, $lte: parseFloat(req.query.maxAmount) };
    }

    // Add search term filter if provided (for claimId)
    if (req.query.searchTerm) {
        query.claimId = { $regex: req.query.searchTerm, $options: 'i' };
    }

    // Add date range filter if provided
    if (req.query.startDate) {
        query.date = { ...query.date, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.date = { ...query.date, $lte: endDate };
    }

    const total = await Claim.countDocuments(query);

    const claims = await Claim.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name email')
      .populate('claimType', 'typeName')
      .populate('status', 'statusName')
      .populate('approvalHistory.status', 'statusName')
      .populate({
        path: 'approvalHistory.approver',
        select: 'name email'
      });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
        page,
        limit,
        total,
        totalPages,
    };
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({ success: true, count: claims.length, pagination, data: claims });

  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all claims for an approver
// @route   GET /api/claims/approver
// @access  Private/Approver
exports.getClaimsForApprover = async (req, res, next) => {
  try {
    const pendingStatuses = await StatusMaster.find({ statusName: /^Pending/ });
    if (!pendingStatuses || pendingStatuses.length === 0) {
      return res.status(500).json({ success: false, message: 'Pending statuses not found.' });
    }
    const pendingStatusIds = pendingStatuses.map(status => status._id);
    const claims = await Claim.find({
      "approvalHistory.approver": req.user.id,
      "approvalHistory.status": { $in: pendingStatusIds },
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
    const user = await User.findById(req.user.id).populate('role');
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

    let firstApprover;
    const submitterRole = user.role;
    const submitterIndex = approvalRule.approvers.findIndex(
        a => a.approverId.toString() === submitterRole._id.toString()
    );

    if (submitterIndex > -1 && submitterIndex < approvalRule.approvers.length - 1) {
        firstApprover = approvalRule.approvers[submitterIndex + 1];
    } else {
        firstApprover = approvalRule.approvers[0];
    }

    if (!firstApprover) {
        return res.status(400).json({ success: false, message: 'Could not determine next approver.' });
    }

    const firstApproverRole = await RoleMaster.findById(firstApprover.approverId);
    if (!firstApproverRole) {
        return res.status(400).json({ success: false, message: 'First approver role not found.' });
    }

    let newStatusName;
    if (firstApproverRole.roleName === 'Admin/Finance Head') {
      newStatusName = 'Pending: Finance Head';
    } else {
      newStatusName = `Pending: ${firstApproverRole.roleName}`;
    }
    const newStatus = await StatusMaster.findOne({ statusName: newStatusName });

    if (!newStatus) {
        return res.status(500).json({ success: false, message: `Status '${newStatusName}' not found.` });
    }

    const claimData = {
      user: user._id,
      claimId: generateClaimId(),
      claimType: validClaimType._id,
      amount,
      description,
      status: newStatus._id,
      approvalHistory: [],
    };
    if (req.file) {
      claimData.attachments = [req.file.path];
    }
    claimData.approvalHistory.push({
      approver: firstApprover.approverId,
      status: newStatus._id,
    });
    const claim = await Claim.create(claimData);

    // Create a notification for the first approver
    await Notification.create({
        user: firstApprover.approverId,
        claim: claim._id,
        message: `A new claim with ID ${claim.claimId} has been submitted for your approval.`,
    });

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
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false });
    }

    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this claim' });
    }

    const { claimType, amount, description } = req.body;
    let updatedData = { claimType, amount, description };

    if (req.file) {
      updatedData.attachments = [req.file.path];
    }

    claim = await Claim.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    await Notification.create({
      user: req.user.id,
      claim: claim._id,
      message: `You have successfully updated claim ${claim.claimId}.`,
    });

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    if (claim.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this claim' });
    }
    if (claim.status.statusName !== 'Returned') {
        const hasBeenApproved = claim.approvalHistory.some(
            (history) => history.status.statusName === 'Approved'
        );
        if (hasBeenApproved) {
            return res.status(400).json({ success: false, message: 'Cannot delete a claim that is already in the approval process.' });
        }
    }
    await claim.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

const sendEmail = require('../utils/email');

// @desc    Approve claim
// @route   PUT /api/claims/:id/approve
// @access  Private/Approver
exports.approveClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id).populate('user').populate('claimType');
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

    // Update the current approver's history record to Approved
    if (claim.approvalHistory.length === 0) {
        return res.status(400).json({ success: false, message: 'This claim has no approval history.' });
    }
    const currentHistory = claim.approvalHistory[claim.approvalHistory.length - 1];
    if (!currentHistory) {
        return res.status(400).json({ success: false, message: 'Could not find current approval history.' });
    }

    if (currentHistory.approver.toString() !== req.user.role._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to approve this claim at this stage' });
    }
    currentHistory.status = approvedStatus._id;
    currentHistory.remarks = req.body.remarks; // Assuming remarks might be optional
    currentHistory.date = Date.now();

    const nextApprover = approvalRule.approvers[currentApproverIndex + 1];
    if (nextApprover) {
      const nextApproverRole = await RoleMaster.findById(nextApprover.approverId);
      if (!nextApproverRole) {
          return res.status(500).json({ success: false, message: 'Next approver role not found.' });
      }
      let newStatusName;
      if (nextApproverRole.roleName === 'Admin/Finance Head') {
        newStatusName = 'Pending: Finance Head';
      } else {
        newStatusName = `Pending: ${nextApproverRole.roleName}`;
      }
      const newStatus = await StatusMaster.findOne({ statusName: newStatusName });
      if (!newStatus) {
        return res.status(500).json({ success: false, message: `Status '${newStatusName}' not found.` });
      }
      claim.status = newStatus._id;
      claim.approvalHistory.push({
        approver: nextApprover.approverId,
        status: newStatus._id,
      });

      // Create a notification for the next approver
      await Notification.create({
          user: nextApprover.approverId,
          claim: claim._id,
          message: `A new claim with ID ${claim.claimId} has been submitted for your approval.`,
      });
    } else {
      claim.status = approvedStatus._id;
    }
    await claim.save();

    const finalStatus = await StatusMaster.findById(claim.status);
    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been updated to ${finalStatus.statusName}.`,
    });

    // Notification for the user who approved the claim
    await Notification.create({
        user: req.user.id,
        claim: claim._id,
        message: `You have approved claim ${claim.claimId}.`,
    });

    // Send email to the user who applied for the claim
    if (finalStatus.statusName === 'Approved') {
        try {
            const approver = req.user.name;
            const claimType = claim.claimType.typeName;
            const amount = claim.amount;
            const description = claim.description;

            const emailMessage = `
                <p>Your claim with ID ${claim.claimId} has been approved.</p>
                <br>
                <p><strong>Claim Details:</strong></p>
                <ul>
                    <li><strong>Claim Type:</strong> ${claimType}</li>
                    <li><strong>Amount:</strong> ${amount}</li>
                    <li><strong>Description:</strong> ${description}</li>
                    <li><strong>Approved by:</strong> ${approver}</li>
                </ul>
            `;

            await sendEmail({
                email: claim.user.email,
                subject: `Claim ${claim.claimId} Approved`,
                message: emailMessage,
                html: emailMessage,
            });
        } catch (err) {
            console.error('There was an error sending the email. ', err);
        }
    }

    res.status(200).json({ success: true, data: claim });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject claim
// @route   PUT /api/claims/:id/reject
// @access  Private/Approver
exports.rejectClaim = async (req, res, next) => {
  try {
    let claim = await Claim.findById(req.params.id).populate('user');
    if (!claim) {
      return res.status(404).json({ success: false });
    }
    const rejectedStatus = await StatusMaster.findOne({ statusName: 'Rejected' });
    if (!rejectedStatus) {
      return res.status(500).json({ success: false, message: 'Rejected status not found.' });
    }
    claim.status = rejectedStatus._id;
    const currentHistory = claim.approvalHistory[claim.approvalHistory.length - 1];
    currentHistory.status = rejectedStatus._id;
    currentHistory.remarks = req.body.remarks;
    await claim.save();

    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been Rejected.`,
    });

    // Send email to the user who applied for the claim
    try {
        const emailMessage = `Your claim with ID ${claim.claimId} has been rejected. Reason: ${req.body.remarks}`;
        await sendEmail({
            email: claim.user.email,
            subject: `Claim ${claim.claimId} Rejected`,
            message: emailMessage,
            html: `<p>Your claim with ID ${claim.claimId} has been rejected.</p><p><strong>Reason:</strong> ${req.body.remarks}</p>`,
        });
    } catch (err) {
        console.error('There was an error sending the email. ', err);
    }

    // Notification for the user who rejected the claim
    await Notification.create({
        user: req.user.id,
        claim: claim._id,
        message: `You have rejected claim ${claim.claimId}.`,
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
    let claim = await Claim.findById(req.params.id).populate('user');
    if (!claim) {
      return res.status(404).json({ success: false });
    }
    const returnedStatus = await StatusMaster.findOne({ statusName: 'Returned' });
    if (!returnedStatus) {
      return res.status(500).json({ success: false, message: 'Returned status not found.' });
    }
    claim.status = returnedStatus._id;
    const currentHistory = claim.approvalHistory[claim.approvalHistory.length - 1];
    currentHistory.status = returnedStatus._id;
    currentHistory.remarks = req.body.remarks;
    await claim.save();

    await Notification.create({
      user: claim.user,
      claim: claim._id,
      message: `Your claim ${claim.claimId} has been Returned for more information.`,
    });

    // Send email to the user who applied for the claim
    try {
        const emailMessage = `Your claim with ID ${claim.claimId} has been returned for more information. Reason: ${req.body.remarks}`;
        await sendEmail({
            email: claim.user.email,
            subject: `Claim ${claim.claimId} Returned`,
            message: emailMessage,
            html: `<p>Your claim with ID ${claim.claimId} has been returned for more information.</p><p><strong>Reason:</strong> ${req.body.remarks}</p>`,
        });
    } catch (err) {
        console.error('There was an error sending the email. ', err);
    }

    // Notification for the user who returned the claim
    await Notification.create({
        user: req.user.id,
        claim: claim._id,
        message: `You have returned claim ${claim.claimId}.`,
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
    let claim = await Claim.findById(req.params.id).populate('user');
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