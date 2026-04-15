const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const protect = async (req, res, next) => {
    let token;

    // 1. Check Authorization Header (Bearer Token) - Priority
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check Browser Cookies
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminOnly = async (req, res, next) => {
    try {
        const workspaceId = req.body.workspaceId || req.params.workspaceId || req.query.workspaceId;

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required for role verification' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());

        if (!member || (member.role !== 'Admin' && member.role !== 'Super Admin')) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error in role verification', error: error.message });
    }
};

module.exports = { protect, adminOnly };
