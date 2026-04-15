const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');

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

exports.listActivities = async (req, res) => {
    try {
        const { workspaceId, limit, page } = req.query;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId is required' });

        const access = await assertWorkspaceMember(workspaceId, req.user.id);
        if (!access.ok) return res.status(access.status).json({ message: access.message });

        const take = Math.min(Number(limit || 10), 200);
        const pageNum = Math.max(Number(page || 1), 1);
        const skip = (pageNum - 1) * take;

        const [total, activities] = await Promise.all([
            Activity.countDocuments({ workspace: workspaceId }),
            Activity.find({ workspace: workspaceId })
            .populate('actor', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(take),
        ]);

        res.json({
            items: activities,
            total,
            page: pageNum,
            limit: take,
            totalPages: Math.max(Math.ceil(total / take), 1),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

