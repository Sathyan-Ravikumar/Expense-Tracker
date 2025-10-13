const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('Manager', 'Finance Officer', 'Admin/Finance Head'), generateReport);

module.exports = router;
