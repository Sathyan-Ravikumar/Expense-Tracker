const express = require('express');
const router = express.Router();
const {
  getSystemAdminNotifications,
  markAllAsRead,
} = require('../controllers/systemAdminNotificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('System Admin'), getSystemAdminNotifications);
router.route('/readall').put(protect, authorize('System Admin'), markAllAsRead);

module.exports = router;
