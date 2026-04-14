const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, inviteMember, getWorkspaceDashboard, getInvitationByToken, acceptInvitation } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/invitations/:token', getInvitationByToken);
router.post('/invitations/:token/accept', protect, acceptInvitation);

router.get('/', protect, getWorkspaces);
router.get('/:id/dashboard', protect, getWorkspaceDashboard);
router.post('/', protect, createWorkspace);
router.post('/:id/invite', protect, inviteMember);

module.exports = router;
