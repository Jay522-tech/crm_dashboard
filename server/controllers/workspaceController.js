const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Deal = require('../models/Deal');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');
const { logActivity } = require('../utils/activityLogger');
const { sendWorkspaceInviteEmail } = require('../utils/mailer');
const crypto = require('crypto');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const buildInviteLink = (req, token) => {
    const origin = process.env.FRONTEND_ORIGIN
        ? process.env.FRONTEND_ORIGIN.split(',')[0].trim()
        : 'http://localhost:5173';
    return `${origin.replace(/\/$/, '')}/accept-invite?token=${encodeURIComponent(token)}`;
};

const acceptInvitationForUser = async ({ invitation, user }) => {
    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) {
        throw Object.assign(new Error('Workspace not found'), { status: 404 });
    }

    const userId = user._id || user.id;

    // Ensure user is not already a member
    const isAlreadyMember = workspace.members.some((m) => String(m) === String(userId));
    if (!isAlreadyMember) {
        workspace.members.push(userId);
        await workspace.save();
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
            members: [req.user.id]
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
        const workspaces = await Workspace.find({ members: req.user.id }).populate('owner members', 'name email');
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
            if (workspace.members.includes(existingUser._id)) {
                return res.status(400).json({ message: 'User already a member' });
            }

            workspace.members.push(existingUser._id);
            await workspace.save();

            await User.findByIdAndUpdate(existingUser._id, { $addToSet: { workspaces: workspace._id } });

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

        if (invitation.expiresAt && invitation.expiresAt.getTime() < Date.now()) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            return res.status(400).json({ message: 'Invite expired' });
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

exports.getWorkspaceDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await Workspace.findById(id).populate('members', 'name email');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const isMember = workspace.members.some((member) => String(member._id) === String(req.user.id));
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
            stageCounts,
            recentDeals,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
