const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, inviteMember } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWorkspaces);
router.post('/', protect, createWorkspace);
router.post('/:id/invite', protect, inviteMember);

module.exports = router;
