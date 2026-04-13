const express = require('express');
const router = express.Router();
const { createDeal, getDealsByWorkspace, updateDeal, addNote, deleteDeal } = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createDeal);
router.get('/workspace/:workspaceId', protect, getDealsByWorkspace);
router.put('/:id', protect, updateDeal);
router.post('/:id/notes', protect, addNote);
router.delete('/:id', protect, deleteDeal);

module.exports = router;
