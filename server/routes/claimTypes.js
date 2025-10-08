const express = require('express');
const router = express.Router();
const { getClaimTypes } = require('../controllers/claimTypeController');

router.route('/').get(getClaimTypes);

module.exports = router;
