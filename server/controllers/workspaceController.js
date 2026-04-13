const Workspace = require('../models/Workspace');
const User = require('../models/User');

exports.createWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.create({
            name: req.body.name,
            owner: req.user.id,
            members: [req.user.id]
        });

        await User.findByIdAndUpdate(req.user.id, { $push: { workspaces: workspace._id } });
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
        const { email } = req.body;
        const { id } = req.params;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const workspace = await Workspace.findById(id);
        if (workspace.members.includes(user._id)) {
            return res.status(400).json({ message: 'User already a member' });
        }

        workspace.members.push(user._id);
        await workspace.save();

        await User.findByIdAndUpdate(user._id, { $push: { workspaces: workspace._id } });
        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
