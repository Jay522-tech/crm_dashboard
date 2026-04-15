const Event = require('../models/Event');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../utils/activityLogger');

async function assertWorkspaceMember(workspaceId, userId) {
    const workspace = await Workspace.findById(workspaceId).select('members');
    if (!workspace) return { ok: false, status: 404, message: 'Workspace not found' };
    const isMember = workspace.members.some((m) => {
        const memberUser = m?.user || m;
        const memberId = memberUser?._id || memberUser?.id || memberUser;
        return String(memberId) === String(userId);
    });
    if (!isMember) return { ok: false, status: 403, message: 'Access denied for this workspace' };
    return { ok: true };
}

exports.listEvents = async (req, res) => {
    try {
        const { workspaceId, from, to } = req.query;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const query = { workspace: workspaceId };
        if (from || to) {
            query.startAt = {};
            if (from) query.startAt.$gte = new Date(from);
            if (to) query.startAt.$lte = new Date(to);
        }

        const events = await Event.find(query)
            .populate('assignee', 'name email')
            .populate('deal', 'title stage amount')
            .populate('contact', 'name email phone')
            .sort({ startAt: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { workspaceId, title, type, startAt, endAt, assignee, deal, contact, notes } = req.body;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });
        if (!title) return res.status(400).json({ message: 'title is required' });
        if (!startAt) return res.status(400).json({ message: 'startAt is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const startDate = new Date(startAt);
        if (Number.isNaN(startDate.getTime())) {
            return res.status(400).json({ message: 'startAt must be a valid datetime' });
        }
        if (startDate.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Event start time cannot be in the past' });
        }

        const event = await Event.create({
            workspace: workspaceId,
            createdBy: req.user.id,
            assignee: assignee || req.user.id,
            title,
            type,
            startAt: startDate,
            endAt: endAt ? new Date(endAt) : undefined,
            deal: deal || undefined,
            contact: contact || undefined,
            notes,
            reminderSentAt: null,
        });

        await logActivity({
            workspace: workspaceId,
            actor: req.user.id,
            type: 'EVENT',
            action: 'CREATED',
            entityType: 'Event',
            entityId: event._id,
            message: `Created event “${event.title}”`,
            metadata: { type: event.type, startAt: event.startAt },
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const access = await assertWorkspaceMember(event.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        Object.assign(event, req.body);
        if (req.body.startAt) {
            const startDate = new Date(req.body.startAt);
            if (Number.isNaN(startDate.getTime())) {
                return res.status(400).json({ message: 'startAt must be a valid datetime' });
            }
            if (startDate.getTime() < Date.now()) {
                return res.status(400).json({ message: 'Event start time cannot be in the past' });
            }
            event.startAt = startDate;
        }
        if (req.body.endAt) event.endAt = new Date(req.body.endAt);
        if (req.body.startAt || req.body.status === 'Scheduled') {
            event.reminderSentAt = null;
        }
        await event.save();

        await logActivity({
            workspace: event.workspace,
            actor: req.user.id,
            type: 'EVENT',
            action: 'UPDATED',
            entityType: 'Event',
            entityId: event._id,
            message: `Updated event “${event.title}”`,
        });

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const access = await assertWorkspaceMember(event.workspace, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        await Event.findByIdAndDelete(event._id);

        await logActivity({
            workspace: event.workspace,
            actor: req.user.id,
            type: 'EVENT',
            action: 'DELETED',
            entityType: 'Event',
            entityId: event._id,
            message: `Deleted event “${event.title}”`,
        });

        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

