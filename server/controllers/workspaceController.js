const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Deal = require('../models/Deal');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Event = require('../models/Event');
const Matter = require('../models/Matter');
const Activity = require('../models/Activity');
const Document = require('../models/Document');
const Communication = require('../models/Communication');
const MessageTemplate = require('../models/MessageTemplate');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');
const { logActivity } = require('../utils/activityLogger');
const { sendWorkspaceInviteEmail } = require('../utils/mailer');
const crypto = require('crypto');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const isLocalHostUrl = (url) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(String(url || ''));

const buildInviteLink = (req, token) => {
    const configuredOrigins = String(process.env.FRONTEND_ORIGIN || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    const requestOrigin = String(req.get('origin') || '').trim();
    const preferredConfigured =
        configuredOrigins.find((o) => !isLocalHostUrl(o)) ||
        configuredOrigins[0] ||
        '';

    const origin = !isLocalHostUrl(requestOrigin) && requestOrigin
        ? requestOrigin
        : preferredConfigured || 'http://localhost:5173';

    return `${origin.replace(/\/$/, '')}/accept-invite?token=${encodeURIComponent(token)}`;
};

const acceptInvitationForUser = async ({ invitation, user }) => {
    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) {
        throw Object.assign(new Error('Workspace not found'), { status: 404 });
    }

    const userId = user._id || user.id;
    console.log(`[AcceptInvite] Attempting to add user ${userId} to workspace ${workspace._id}`);

    // Ensure user is not already a member
    const isAlreadyMember = workspace.members.some((m) => {
        const memberId = m.user?._id || m.user || m;
        return String(memberId) === String(userId);
    });

    if (!isAlreadyMember) {
        workspace.members.push({ user: userId, role: 'Member' });
        await workspace.save();
        console.log(`[AcceptInvite] User ${userId} added to workspace ${workspace._id}`);
    } else {
        console.log(`[AcceptInvite] User ${userId} already member of ${workspace._id}`);
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { workspaces: workspace._id } });

    invitation.status = 'ACCEPTED';
    invitation.acceptedBy = userId;
    invitation.acceptedAt = new Date();
    await invitation.save();

    return workspace;
};

exports.createWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.create({
            name: req.body.name,
            owner: req.user.id,
            members: [{ user: req.user.id, role: 'Super Admin' }]
        });

        await User.findByIdAndUpdate(req.user.id, { $push: { workspaces: workspace._id } });

        await logActivity({
            workspace: workspace._id,
            actor: req.user.id,
            type: 'WORKSPACE',
            action: 'CREATED',
            entityType: 'Workspace',
            entityId: workspace._id,
            message: `Created workspace “${workspace.name}”`,
        });

        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ "members.user": req.user.id })
            .populate('owner', 'name email')
            .populate('members.user', 'name email');
        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.inviteMember = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { id } = req.params;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`[InviteMember] User ${existingUser._id} exists, adding directly.`);
            const isAlreadyMember = workspace.members.some(m => {
                const memberId = m.user?._id || m.user || m;
                return String(memberId) === String(existingUser._id);
            });

            if (isAlreadyMember) {
                return res.status(400).json({ message: 'User already a member' });
            }

            workspace.members.push({ user: existingUser._id, role: 'Member' });
            await workspace.save();
            await User.findByIdAndUpdate(existingUser._id, { $addToSet: { workspaces: workspace._id } });
            console.log(`[InviteMember] Added existing user ${existingUser._id} to workspace.`);

            await logActivity({
                workspace: workspace._id,
                actor: req.user.id,
                type: 'WORKSPACE',
                action: 'MEMBER_INVITED',
                entityType: 'Workspace',
                entityId: workspace._id,
                message: `Invited ${existingUser.email} to workspace “${workspace.name}”`,
                metadata: { invitedUserId: existingUser._id, invitedEmail: existingUser.email },
            });

            return res.json({ mode: 'added_existing_user', workspace });
        }

        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Check if a pending invite already exists for this email
        const existingInvite = await WorkspaceInvitation.findOne({ workspace: workspace._id, email, status: 'PENDING' });
        if (existingInvite) {
            existingInvite.expiresAt = expiresAt; // renew expiry
            await existingInvite.save();
            return res.json({
                mode: 'invite_renewed',
                invitation: existingInvite,
                inviteLink: buildInviteLink(req, existingInvite.token)
            });
        }

        const invitation = await WorkspaceInvitation.create({
            workspace: workspace._id,
            email,
            token,
            invitedBy: req.user.id,
            status: 'PENDING',
            expiresAt,
        });

        const inviteLink = buildInviteLink(req, invitation.token);
        let mail = { ok: false };
        try {
            mail = await sendWorkspaceInviteEmail({
                to: invitation.email,
                inviteLink,
                workspaceName: workspace.name,
                invitedByEmail: req.user?.email,
            });
        } catch (e) {
            mail = { ok: false, error: e?.message || 'Email send failed' };
        }

        await logActivity({
            workspace: workspace._id,
            actor: req.user.id,
            type: 'WORKSPACE',
            action: 'INVITE_CREATED',
            entityType: 'Workspace',
            entityId: workspace._id,
            message: `Created an invite for ${email} in workspace “${workspace.name}”`,
            metadata: { invitedEmail: email, invitationId: invitation._id, mailSent: Boolean(mail.ok) },
        });

        res.json({
            mode: 'created_invite',
            invitation: { token: invitation.token, email: invitation.email, expiresAt: invitation.expiresAt },
            inviteLink,
            mailSent: Boolean(mail.ok),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInvitationByToken = async (req, res) => {
    try {
        const token = String(req.params.token || '').trim();
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const invitation = await WorkspaceInvitation.findOne({ token });
        if (!invitation) return res.status(404).json({ message: 'Invite not found' });

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ message: `Invite is ${invitation.status.toLowerCase()}` });
        }

        if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            return res.status(400).json({ message: 'Invite expired' });
        }

        const workspace = await Workspace.findById(invitation.workspace).select('name');
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        res.json({
            token: invitation.token,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            workspace: { _id: workspace._id, name: workspace.name },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.acceptInvitation = async (req, res) => {
    try {
        const token = String(req.params.token || '').trim();
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const invitation = await WorkspaceInvitation.findOne({ token });
        if (!invitation) return res.status(404).json({ message: 'Invite not found' });

        if (invitation.status !== 'PENDING') {
            return res.status(400).json({ message: `Invite is ${invitation.status.toLowerCase()}` });
        }

        const userEmail = normalizeEmail(req.user.email);
        const inviteEmail = normalizeEmail(invitation.email);

        if (userEmail !== inviteEmail) {
            return res.status(403).json({
                message: `This invitation was sent to ${inviteEmail}, but you are logged in as ${userEmail}.`
            });
        }

        const me = await User.findById(req.user.id).select('email name');
        const workspace = await acceptInvitationForUser({ invitation, user: req.user });

        await logActivity({
            workspace: workspace._id,
            actor: req.user.id,
            type: 'WORKSPACE',
            action: 'INVITE_ACCEPTED',
            entityType: 'Workspace',
            entityId: workspace._id,
            message: `${me?.email || 'A user'} joined workspace “${workspace.name}” via invite`,
            metadata: { invitedEmail: invitation.email, invitationId: invitation._id },
        });

        res.json({ workspace });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getPendingInvitations = async (req, res) => {
    try {
        const { id } = req.params;
        const invitations = await WorkspaceInvitation.find({
            workspace: id,
            status: 'PENDING',
            expiresAt: { $gt: new Date() }
        }).select('email status createdAt');
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkspaceDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await Workspace.findById(id).populate('members.user', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const isMember = workspace.members.some((member) => String(member.user?._id || member.user) === String(req.user.id));
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied for this workspace' });
        }

        const deals = await Deal.find({ workspace: id }).populate('assignee', 'name email');
        const stageOrder = ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost'];

        const stageCounts = stageOrder.reduce((acc, stage) => {
            acc[stage] = 0;
            return acc;
        }, {});

        let totalValue = 0;
        let wonValue = 0;

        for (const deal of deals) {
            const amount = Number(deal.amount || 0);
            totalValue += amount;
            stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;

            if (deal.stage === 'Won') {
                wonValue += amount;
            }
        }

        const totalDeals = deals.length;
        const wonDeals = stageCounts.Won || 0;
        const lostDeals = stageCounts.Lost || 0;
        const openDeals = totalDeals - wonDeals - lostDeals;
        const winRate = totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(1)) : 0;

        // --- New Aggregations ---

        // 1. Revenue Growth (Last 6 Months) - Workspace specific
        const growthData = await Deal.aggregate([
            { $match: { workspace: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    value: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 }
        ]);

        const formattedGrowth = growthData.map(d => ({
            name: new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'short' }),
            value: d.value,
            deals: d.count
        }));

        // 2. Assignee Performance Distribution
        const assigneeDistribution = await Deal.aggregate([
            { $match: { workspace: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: "$assignee",
                    count: { $sum: 1 },
                    value: { $sum: "$amount" }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ["$user.name", "Unassigned"] },
                    count: 1,
                    value: 1
                }
            },
            { $sort: { value: -1 } }
        ]);

        const recentDeals = [...deals]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map((deal) => ({
                _id: deal._id,
                title: deal.title,
                stage: deal.stage,
                amount: deal.amount || 0,
                assignee: deal.assignee ? { _id: deal.assignee._id, name: deal.assignee.name } : null,
                updatedAt: deal.updatedAt,
            }));

        res.json({
            workspace: {
                _id: workspace._id,
                name: workspace.name,
                membersCount: workspace.members.length,
            },
            summary: {
                totalDeals,
                openDeals,
                wonDeals,
                lostDeals,
                totalValue,
                wonValue,
                winRate,
            },
            growthData: formattedGrowth,
            assigneeDistribution,
            stageCounts,
            recentDeals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Role Management
exports.updateMemberRole = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body;

        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        // Check permissions: only Super Admin or Admins can change roles
        const requester = workspace.members.find(m => String(m.user) === String(req.user.id));
        if (!requester || (requester.role !== 'Super Admin' && requester.role !== 'Admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const memberIndex = workspace.members.findIndex(m => String(m.user) === String(userId));
        if (memberIndex === -1) return res.status(404).json({ message: 'Member not found' });

        workspace.members[memberIndex].role = role;
        await workspace.save();

        const updatedWorkspace = await Workspace.findById(id).populate('owner members.user', 'name email');
        res.json(updatedWorkspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        // Check permissions: only Super Admin or Admins can remove members
        const requester = workspace.members.find(m => String(m.user) === String(req.user.id));
        if (!requester || (requester.role !== 'Super Admin' && requester.role !== 'Admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Prevent removing the owner
        if (String(workspace.owner) === String(userId)) {
            return res.status(400).json({ message: 'Cannot remove workspace owner' });
        }

        workspace.members = workspace.members.filter(m => String(m.user) !== String(userId));
        await workspace.save();

        await User.findByIdAndUpdate(userId, { $pull: { workspaces: workspace._id } });

        const updatedWorkspace = await Workspace.findById(id).populate('owner members.user', 'name email');
        res.json(updatedWorkspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const requester = workspace.members.find(
            (m) => String(m.user?._id || m.user) === String(req.user.id)
        );
        if (!requester || (requester.role !== 'Super Admin' && requester.role !== 'Admin')) {
            return res.status(403).json({ message: 'You must be an Admin or Super Admin to update this workspace' });
        }

        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (trimmed.length < 1) return res.status(400).json({ message: 'Name is required' });
            if (trimmed.length > 120) return res.status(400).json({ message: 'Name is too long' });
            workspace.name = trimmed;
            await workspace.save();
        }

        const updated = await Workspace.findById(id).populate('owner members.user', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const requester = workspace.members.find(
            (m) => String(m.user?._id || m.user) === String(req.user.id)
        );
        const isOwner = String(workspace.owner) === String(req.user.id);
        const isSuperAdminMember = requester?.role === 'Super Admin';
        if (!isOwner && !isSuperAdminMember) {
            return res.status(403).json({ message: 'Only the owner or a Super Admin can delete this workspace' });
        }

        const wid = workspace._id;

        await Deal.deleteMany({ workspace: wid });
        await Contact.deleteMany({ workspace: wid });
        await Event.deleteMany({ workspace: wid });
        await Matter.deleteMany({ workspace: wid });
        await Activity.deleteMany({ workspace: wid });
        await Document.deleteMany({ workspaceId: wid });
        await Communication.deleteMany({ workspaceId: wid });
        await MessageTemplate.deleteMany({ workspaceId: wid });
        await WorkspaceInvitation.deleteMany({ workspace: wid });

        await Workspace.findByIdAndDelete(wid);
        await User.updateMany({}, { $pull: { workspaces: wid } });

        res.json({ message: 'Workspace deleted', id: wid });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
