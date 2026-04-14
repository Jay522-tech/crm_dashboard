const Communication = require('../models/Communication');
const MessageTemplate = require('../models/MessageTemplate');

// --- Template Controllers ---

exports.createTemplate = async (req, res) => {
    try {
        const template = await MessageTemplate.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error creating template', error: error.message });
    }
};

exports.getWorkspaceTemplates = async (req, res) => {
    try {
        const templates = await MessageTemplate.find({ workspaceId: req.params.workspaceId })
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        await MessageTemplate.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting template', error: error.message });
    }
};

// --- Communication History Controllers ---

exports.logCommunication = async (req, res) => {
    try {
        const communication = await Communication.create({
            ...req.body,
            sentBy: req.user._id
        });
        res.status(201).json(communication);
    } catch (error) {
        res.status(500).json({ message: 'Error logging communication', error: error.message });
    }
};

exports.getWorkspaceCommunications = async (req, res) => {
    try {
        const communications = await Communication.find({ workspaceId: req.params.workspaceId })
            .populate('contactId', 'name email')
            .populate('sentBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(communications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching communications', error: error.message });
    }
};
