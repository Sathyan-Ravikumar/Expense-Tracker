const User = require('../models/User');
const RoleMaster = require('../models/RoleMaster');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/email');

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

// @desc    Get all managers
// @route   GET /api/users/managers
// @access  Private/Admin
exports.getManagers = async (req, res, next) => {
  try {
    const managerRole = await RoleMaster.findOne({ roleName: 'Manager' });
    if (!managerRole) {
      return res.status(404).json({ success: false, message: 'Manager role not found' });
    }
    const managers = await User.find({ role: managerRole._id });
    res.status(200).json({ success: true, data: managers });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Get users by role
// @route   GET /api/users/role/:roleName
// @access  Private/Admin
exports.getUsersByRole = async (req, res, next) => {
  try {
    const role = await RoleMaster.findOne({ roleName: req.params.roleName });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    const users = await User.find({ role: role._id });
    res.status(200).json({ success: true, data: users });
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
    const user = await User.findById(req.params.id).populate('role');
    if (!user) {
      return res.status(404).json({ success: false });
    }

    const oldRole = user.role;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('role');

    // Create a notification for the System Admin
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `User ${updatedUser.name} has been updated by ${req.user.name}.`,
            });
        }
    }

    // Send email to user if role has changed
    if (oldRole._id.toString() !== updatedUser.role._id.toString()) {
        try {
            const emailMessage = `Your role has been updated to ${updatedUser.role.roleName}.`;
            await sendEmail({
                email: updatedUser.email,
                subject: 'Your role has been updated',
                message: emailMessage,
                html: `<p>${emailMessage}</p>`,
            });
        } catch (err) {
            console.error('There was an error sending the email. ', err);
        }
    }

    res.status(200).json({ success: true, data: updatedUser });
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

    // Create a notification for the System Admin
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `User ${user.name} has been deleted by ${req.user.name}.`,
            });
        }
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  const { name, email, password, role, manager } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
      role,
      manager,
    });

    // Create a notification for the System Admin
    const systemAdminRole = await RoleMaster.findOne({ roleName: 'System Admin' });
    if (systemAdminRole) {
        const systemAdmin = await User.findOne({ role: systemAdminRole._id });
        if (systemAdmin) {
            await Notification.create({
                user: systemAdmin._id,
                message: `A new user, ${user.name}, has been created by ${req.user.name}.`,
            });
        }
    }

    // Send welcome email to the new user
    try {
        const emailMessage = `An account has been created for you on Expense Tracker. Your username is ${user.email}. Please log in and change your password.`;
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Expense Tracker!',
            message: emailMessage,
            html: `<p>${emailMessage}</p>`,
        });
    } catch (err) {
        console.error('There was an error sending the email. ', err);
    }

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
