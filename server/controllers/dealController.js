const Deal = require('../models/Deal');
const { logActivity } = require('../utils/activityLogger');

exports.createDeal = async (req, res) => {
    try {
        const deal = await Deal.create({
            ...req.body,
            workspace: req.body.workspaceId
        });

        await logActivity({
            workspace: deal.workspace,
            actor: req.user.id,
            type: 'DEAL',
            action: 'CREATED',
            entityType: 'Deal',
            entityId: deal._id,
            message: `Created deal “${deal.title}”`,
        });

        const populatedDeal = await Deal.findById(deal._id).populate('assignee', 'name email');
        res.status(201).json(populatedDeal);
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
        const before = await Deal.findById(req.params.id);
        const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignee', 'name email');

        if (deal) {
            const stageChanged = before && req.body.stage && before.stage !== req.body.stage;
            await logActivity({
                workspace: deal.workspace,
                actor: req.user.id,
                type: 'DEAL',
                action: stageChanged ? 'STAGE_CHANGED' : 'UPDATED',
                entityType: 'Deal',
                entityId: deal._id,
                message: stageChanged
                    ? `Moved deal “${deal.title}” to ${deal.stage}`
                    : `Updated deal “${deal.title}”`,
                metadata: stageChanged ? { from: before.stage, to: deal.stage } : {},
            });
        }

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

        await logActivity({
            workspace: deal.workspace,
            actor: req.user.id,
            type: 'DEAL',
            action: 'NOTE_ADDED',
            entityType: 'Deal',
            entityId: deal._id,
            message: `Added a note on “${deal.title}”`,
        });

        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDeal = async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.id);
        await Deal.findByIdAndDelete(req.params.id);

        if (deal) {
            await logActivity({
                workspace: deal.workspace,
                actor: req.user.id,
                type: 'DEAL',
                action: 'DELETED',
                entityType: 'Deal',
                entityId: deal._id,
                message: `Deleted deal “${deal.title}”`,
            });
        }

        res.json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
