const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
} = require('../controllers/approvalRuleController');

router
  .route('/')
  .get(protect, authorize('Admin', 'System Admin'), getApprovalRules)
  .post(protect, authorize('Admin', 'System Admin'), createApprovalRule);

router
  .route('/:id')
  .put(protect, authorize('Admin', 'System Admin'), updateApprovalRule)
  .delete(protect, authorize('Admin', 'System Admin'), deleteApprovalRule);

module.exports = router;
