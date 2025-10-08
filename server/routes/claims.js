const express = require('express');
const router = express.Router();
const {
  getClaims,
  getMyClaims,
  getManagerClaims,
  getClaim,
  createClaim,
  updateClaim,
  deleteClaim,
  approveClaim,
  rejectClaim,
  returnClaim,
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(protect, authorize('Manager', 'Finance Officer', 'Admin/Finance Head', 'System Admin'), getClaims)
  .post(protect, upload, createClaim);

router.route('/manager').get(protect, authorize('Manager'), getManagerClaims);

router.route('/my').get(protect, getMyClaims);

router
  .route('/:id')
  .get(protect, getClaim)
  .put(protect, updateClaim)
  .delete(protect, deleteClaim);

router.route('/:id/approve').put(protect, authorize('Manager', 'Finance Officer', 'Admin/Finance Head'), approveClaim);
router.route('/:id/reject').put(protect, authorize('Manager', 'Finance Officer', 'Admin/Finance Head'), rejectClaim);
router.route('/:id/return').put(protect, authorize('Manager', 'Finance Officer', 'Admin/Finance Head'), returnClaim);

module.exports = router;
