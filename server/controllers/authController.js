const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });

        // Create default workspace
        const workspace = await Workspace.create({
            name: 'My Workspace',
            owner: user._id,
            members: [user._id]
        });

        user.workspaces.push(workspace._id);
        await user.save();

        const token = generateToken(user._id);

        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
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
            res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
            res.json({ id: user._id, name: user.name, email: user.email });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.status(200).json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
};
