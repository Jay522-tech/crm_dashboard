const Deal = require('../models/Deal');

exports.createDeal = async (req, res) => {
    try {
        const deal = await Deal.create({
            ...req.body,
            workspace: req.body.workspaceId
        });
        res.status(201).json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDealsByWorkspace = async (req, res) => {
    try {
        const deals = await Deal.find({ workspace: req.params.workspaceId }).populate('assignee', 'name email');
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDeal = async (req, res) => {
    try {
        const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addNote = async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        deal.notes.push({ content: req.body.content });
        await deal.save();
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDeal = async (req, res) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
