const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listMatters, createMatter, updateMatter, deleteMatter } = require('../controllers/matterController');

router.get('/', protect, listMatters);
router.post('/', protect, createMatter);
router.put('/:id', protect, updateMatter);
router.delete('/:id', protect, deleteMatter);

module.exports = router;

