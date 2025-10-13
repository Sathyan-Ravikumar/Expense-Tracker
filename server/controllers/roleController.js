const RoleMaster = require('../models/RoleMaster');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/System Admin
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await RoleMaster.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create a role
// @route   POST /api/roles
// @access  Private/System Admin
exports.createRole = async (req, res, next) => {
  try {
    const role = await RoleMaster.create(req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/System Admin
exports.updateRole = async (req, res, next) => {
  try {
    const role = await RoleMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!role) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: role });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/System Admin
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await RoleMaster.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
