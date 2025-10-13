const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/all').get(protect, authorize('System Admin'), getAllNotifications);
router.route('/readall').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);

module.exports = router;
