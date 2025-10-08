const ClaimTypeMaster = require('../models/ClaimTypeMaster');

// @desc    Get all claim types
// @route   GET /api/claim-types
// @access  Public
exports.getClaimTypes = async (req, res, next) => {
  try {
    const claimTypes = await ClaimTypeMaster.find();
    res.status(200).json({ success: true, data: claimTypes });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
