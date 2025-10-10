const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('claim', 'claimId');

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Make sure user is the notification owner
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/readall
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
      await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  
      res.status(200).json({ success: true, data: {} });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
