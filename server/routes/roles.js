const express = require('express');
const router = express.Router();
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this file are protected and only accessible by System Admins
router.use(protect);
router.use(authorize('System Admin'));

router
  .route('/')
  .get(getRoles)
  .post(createRole);

router
  .route('/:id')
  .put(updateRole)
  .delete(deleteRole);

module.exports = router;
