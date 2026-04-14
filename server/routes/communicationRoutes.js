const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    createTemplate,
    getWorkspaceTemplates,
    deleteTemplate,
    logCommunication,
    getWorkspaceCommunications
} = require('../controllers/communicationController');

// Template Routes
router.post('/templates', protect, adminOnly, createTemplate);
router.get('/templates/workspace/:workspaceId', protect, getWorkspaceTemplates);
router.delete('/templates/:id', protect, adminOnly, deleteTemplate);

// Communication History Routes
router.post('/log', protect, logCommunication);
router.get('/workspace/:workspaceId', protect, getWorkspaceCommunications);

module.exports = router;
