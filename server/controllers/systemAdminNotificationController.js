const SystemAdminNotification = require('../models/SystemAdminNotification');

// @desc    Get all system admin notifications
// @route   GET /api/system-admin-notifications
// @access  Private/System Admin
exports.getSystemAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await SystemAdminNotification.find({})
        .populate('admin', 'name')
        .populate('affectedUser', 'name')
        .populate({
            path: 'affectedRule',
            populate: {
                path: 'claimType',
                select: 'typeName'
            }
        });
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Mark all system admin notifications as read
// @route   PUT /api/system-admin-notifications/readall
// @access  Private/System Admin
exports.markAllAsRead = async (req, res, next) => {
    try {
      await SystemAdminNotification.updateMany({ admin: req.user.id, isRead: false }, { isRead: true });
  
      res.status(200).json({ success: true, data: {} });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
