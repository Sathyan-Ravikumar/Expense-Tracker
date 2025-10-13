const User = require('../models/User');
const RoleMaster = require('../models/RoleMaster');
const SystemAdminNotification = require('../models/SystemAdminNotification');

// @desc    Get all roles
// @route   GET /api/users/roles
// @access  Private/Admin
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await RoleMaster.find();
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchTerm = req.query.searchTerm || '';
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const query = {};
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query).skip(startIndex).limit(limit).populate('role');

    const pagination = {};
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

    res.status(200).json({ success: true, count: users.length, pagination, data: users });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false });
    }

    // Create a notification for the System Admin
    await SystemAdminNotification.create({
      admin: req.user.id,
      action: 'user_updated',
      affectedUser: user._id,
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
