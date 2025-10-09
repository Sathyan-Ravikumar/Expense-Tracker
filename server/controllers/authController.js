const User = require('../models/User');
const RoleMaster = require('../models/RoleMaster');
const jwt = require('jsonwebtoken');


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Find the default 'Employee' role
    const employeeRole = await RoleMaster.findOne({ roleName: 'Employee' });
    if (!employeeRole) {
      return res.status(500).json({ success: false, message: 'Default Employee role not found. Please create it in RoleMaster.' });
    }

    // Create user with the Employee role
    const user = await User.create({
      name,
      email,
      password,
      role: employeeRole._id,
    });

    // Populate the role field before sending the token response
    await user.populate('role');

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  // Check for user and populate role
  const user = await User.findOne({ email }).select('+password').populate('role');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create access token
  const accessToken = jwt.sign(
    { id: user._id, role: user.role.roleName, department: user.department },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Create refresh token
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
};
