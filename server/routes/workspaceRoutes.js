const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, inviteMember, getWorkspaceDashboard, getInvitationByToken, acceptInvitation, updateMemberRole, removeMember, getPendingInvitations } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/permissionMiddleware');

router.get('/invitations/:token', getInvitationByToken);
router.post('/invitations/:token/accept', protect, acceptInvitation);

router.get('/', protect, getWorkspaces);
router.get('/:id/dashboard', protect, getWorkspaceDashboard);
router.get('/:id/invitations', protect, getPendingInvitations);
router.post('/', protect, createWorkspace);

router.post('/:id/invite', protect, checkRole(['Super Admin', 'Admin']), inviteMember);
router.put('/:id/members/:userId/role', protect, checkRole(['Super Admin', 'Admin']), updateMemberRole);
router.delete('/:id/members/:userId', protect, checkRole(['Super Admin', 'Admin']), removeMember);

module.exports = router;
