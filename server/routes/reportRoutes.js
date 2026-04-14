const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReportStats } = require('../controllers/reportController');

router.get('/stats', protect, getReportStats);

module.exports = router;
