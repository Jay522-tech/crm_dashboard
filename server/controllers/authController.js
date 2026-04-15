const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    };
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, inviteToken } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });

        // If user registered via invite, join invited workspace; otherwise create default workspace.
        if (inviteToken) {
            const invitation = await WorkspaceInvitation.findOne({ token: String(inviteToken).trim() });
            if (invitation && invitation.status === 'PENDING' && (!invitation.expiresAt || invitation.expiresAt.getTime() >= Date.now())) {
                const workspace = await Workspace.findById(invitation.workspace);
                if (workspace) {
                    const isMember = workspace.members.some((m) => {
                        const memberId = m.user?._id || m.user || m;
                        return String(memberId) === String(user._id);
                    });
                    if (!isMember) {
                        workspace.members.push({ user: user._id, role: 'Member' });
                        await workspace.save();
                    }
                    user.workspaces.push(workspace._id);
                    invitation.status = 'ACCEPTED';
                    invitation.acceptedBy = user._id;
                    invitation.acceptedAt = new Date();
                    await invitation.save();
                }
            }
        }

        if ((user.workspaces || []).length === 0) {
            const workspace = await Workspace.create({
                name: 'My Workspace',
                owner: user._id,
                members: [{ user: user._id, role: 'Super Admin' }]
            });

            user.workspaces.push(workspace._id);
        }

        await user.save();

        const token = generateToken(user._id);

        res.cookie('token', token, getCookieOptions());
        res.status(201).json({ id: user._id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, getCookieOptions());
            res.json({ id: user._id, name: user.name, email: user.email });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', { ...getCookieOptions(), expires: new Date(0), maxAge: 0 });
    res.status(200).json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
};

exports.updateMe = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (trimmed.length < 1) return res.status(400).json({ message: 'Name is required' });
            if (trimmed.length > 120) return res.status(400).json({ message: 'Name is too long' });
            user.name = trimmed;
            await user.save();
        }

        const fresh = await User.findById(req.user.id).select('-password');
        res.json(fresh);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
