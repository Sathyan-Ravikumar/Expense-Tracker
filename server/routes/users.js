const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getRoles,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/roles').get(protect, authorize('System Admin'), getRoles);

router
  .route('/')
  .get(protect, authorize('System Admin'), getUsers);

router
  .route('/:id')
  .get(protect, authorize('System Admin'), getUser)
  .put(protect, authorize('System Admin'), updateUser)
  .delete(protect, authorize('System Admin'), deleteUser);

module.exports = router;
