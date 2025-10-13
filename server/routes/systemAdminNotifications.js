const express = require('express');
const router = express.Router();
const { getSystemAdminNotifications } = require('../controllers/systemAdminNotificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('System Admin'), getSystemAdminNotifications);

module.exports = router;
