const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listActivities } = require('../controllers/activityController');

router.get('/', protect, listActivities);

module.exports = router;

