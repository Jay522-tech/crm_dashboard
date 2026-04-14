const Matter = require('../models/Matter');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../utils/activityLogger');

async function assertWorkspaceMember(workspaceId, userId) {
    const workspace = await Workspace.findById(workspaceId).select('members');
    if (!workspace) return { ok: false, status: 404, message: 'Workspace not found' };
    const isMember = workspace.members.some((m) => String(m) === String(userId));
    if (!isMember) return { ok: false, status: 403, message: 'Access denied for this workspace' };
    return { ok: true };
}

exports.listMatters = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const matters = await Matter.find({ workspace: workspaceId })
            .populate('assignee', 'name email')
            .populate('contact', 'name email')
            .sort({ updatedAt: -1 });

        res.json(matters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMatter = async (req, res) => {
    try {
        const { workspaceId, title, status, priority, dueAt, description, contact, assignee, tags } = req.body;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });
        if (!title) return res.status(400).json({ message: 'title is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const matter = await Matter.create({
            workspace: workspaceId,
            createdBy: req.user.id,
            title,
            status,
            priority,
            dueAt: dueAt ? new Date(dueAt) : undefined,
            description,
            contact: contact || undefined,
            assignee: assignee || undefined,
            tags: Array.isArray(tags) ? tags : [],
            reminderSentAt: null,
        });

        await logActivity({
            workspace: workspaceId,
            actor: req.user.id,
            type: 'MATTER',
            action: 'CREATED',
            entityType: 'Matter',
            entityId: matter._id,
            message: `Created matter “${matter.title}”`,
        });

        res.status(201).json(matter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMatter = async (req, res) => {
    try {
        const matter = await Matter.findById(req.params.id);
        if (!matter) return res.status(404).json({ message: 'Matter not found' });

        const access = await assertWorkspaceMember(matter.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        Object.assign(matter, req.body);
        if (req.body.dueAt) matter.dueAt = new Date(req.body.dueAt);
        if (req.body.dueAt || req.body.status === 'Open' || req.body.status === 'In Progress' || req.body.status === 'Review') {
            matter.reminderSentAt = null;
        }
        await matter.save();

        await logActivity({
            workspace: matter.workspace,
            actor: req.user.id,
            type: 'MATTER',
            action: 'UPDATED',
            entityType: 'Matter',
            entityId: matter._id,
            message: `Updated matter “${matter.title}”`,
        });

        res.json(matter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMatter = async (req, res) => {
    try {
        const matter = await Matter.findById(req.params.id);
        if (!matter) return res.status(404).json({ message: 'Matter not found' });

        const access = await assertWorkspaceMember(matter.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        await Matter.findByIdAndDelete(matter._id);

        await logActivity({
            workspace: matter.workspace,
            actor: req.user.id,
            type: 'MATTER',
            action: 'DELETED',
            entityType: 'Matter',
            entityId: matter._id,
            message: `Deleted matter “${matter.title}”`,
        });

        res.json({ message: 'Matter deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

