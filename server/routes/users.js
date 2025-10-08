const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, authorize('System Admin'), getUsers);

router
  .route('/:id')
  .get(protect, authorize('System Admin'), getUser)
  .put(protect, authorize('System Admin'), updateUser)
  .delete(protect, authorize('System Admin'), deleteUser);

module.exports = router;
