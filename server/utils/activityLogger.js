const Activity = require('../models/Activity');

async function logActivity({
    workspace,
    actor,
    type,
    action,
    entityType,
    entityId,
    message,
    metadata,
}) {
    try {
        if (!workspace || !actor || !type || !action) return;

        await Activity.create({
            workspace,
            actor,
            type,
            action,
            entityType,
            entityId,
            message,
            metadata: metadata || {},
        });
    } catch {
        // Intentionally swallow errors — activity log should never break core flows
    }
}

module.exports = { logActivity };

