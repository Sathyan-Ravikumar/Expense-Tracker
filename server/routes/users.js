const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getManagers,
  getUsersByRole,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/roles').get(protect, authorize('System Admin'), getRoles);

router.route('/').get(protect, authorize('System Admin'), getUsers).post(protect, authorize('System Admin'), createUser);
router.route('/managers').get(protect, authorize('System Admin'), getManagers);
router.route('/role/:roleName').get(protect, authorize('System Admin'), getUsersByRole);

router
  .route('/:id')
  .get(protect, authorize('System Admin'), getUser)
  .put(protect, authorize('System Admin'), updateUser)
  .delete(protect, authorize('System Admin'), deleteUser);

module.exports = router;
