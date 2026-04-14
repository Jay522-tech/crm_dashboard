const Workspace = require('../models/Workspace');

/**
 * Middleware to check if user has required roles in the workspace.
 * Requires req.params.id (workspace ID) or req.body.workspaceId.
 * @param {Array} allowedRoles - List of roles that are allowed (e.g., ['Super Admin', 'Admin'])
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const workspaceId = req.params.id || req.body.workspaceId || req.params.workspaceId;
            if (!workspaceId) {
                return res.status(400).json({ message: 'Workspace ID is required' });
            }

            const workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return res.status(404).json({ message: 'Workspace not found' });
            }

            const member = workspace.members.find(m => String(m.user) === String(req.user.id));

            if (!member) {
                return res.status(403).json({ message: 'Access denied: Not a member of this workspace' });
            }

            if (!allowedRoles.includes(member.role)) {
                return res.status(403).json({ message: `Access denied: Requires one of these roles: ${allowedRoles.join(', ')}` });
            }

            // Attach user's role to request for later use if needed
            req.userWorkspaceRole = member.role;
            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = { checkRole };
