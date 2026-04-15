const Deal = require('../models/Deal');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

exports.getReportStats = async (req, res) => {
    try {
        const { workspaceId, scope } = req.query; // scope: 'global' or 'workspace'
        let filter = {};

        if (scope === 'workspace' && workspaceId) {
            filter.workspace = new mongoose.Types.ObjectId(workspaceId);
        } else {
            // For global, we should only include workspaces where the user is a member
            const userWorkspaces = await Workspace.find({
                'members.user': req.user._id
            }).select('_id');
            const workspaceIds = userWorkspaces.map(w => w._id);
            filter.workspace = { $in: workspaceIds };
        }

        // Aggregate stats
        const stats = await Deal.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalDeals: { $sum: 1 },
                    totalValue: { $sum: '$amount' },
                    wonValue: {
                        $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, '$amount', 0] }
                    },
                    lostValue: {
                        $sum: { $cond: [{ $eq: ['$stage', 'Lost'] }, '$amount', 0] }
                    },
                    avgDealValue: { $avg: '$amount' }
                }
            }
        ]);

        // Stage distribution
        const stageDistribution = await Deal.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    value: { $sum: '$amount' }
                }
            }
        ]);

        // Pipeline Growth (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const growthData = await Deal.aggregate([
            {
                $match: {
                    ...filter,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    value: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top Deals (highest amount) — match workspace dashboard shape for UI
        const topDeals = await Deal.find(filter)
            .sort({ amount: -1 })
            .limit(5)
            .select('title amount stage workspace updatedAt')
            .populate('workspace', 'name')
            .populate('assignee', 'name email');

        // Revenue by Workspace (only relevant for global scope)
        let revenueByWorkspace = [];
        if (scope === 'global') {
            revenueByWorkspace = await Deal.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$workspace',
                        totalValue: { $sum: '$amount' },
                        wonValue: { $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, '$amount', 0] } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'workspaces',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'workspaceInfo'
                    }
                },
                { $unwind: '$workspaceInfo' },
                {
                    $project: {
                        name: '$workspaceInfo.name',
                        totalValue: 1,
                        wonValue: 1,
                        count: 1
                    }
                },
                { $sort: { totalValue: -1 } }
            ]);
        }

        // Assignee Performance
        const assigneeDistribution = await Deal.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$assignee',
                    count: { $sum: 1 },
                    value: { $sum: '$amount' },
                    wonCount: { $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ['$userInfo.name', 'Unassigned'] },
                    count: 1,
                    value: 1,
                    wonCount: 1,
                    winRate: {
                        $cond: [
                            { $gt: ['$count', 0] },
                            { $multiply: [{ $divide: ['$wonCount', '$count'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { value: -1 } }
        ]);

        const base = stats[0] || {
            totalDeals: 0,
            totalValue: 0,
            wonValue: 0,
            lostValue: 0,
            avgDealValue: 0
        };
        const stageCountMap = Object.fromEntries(stageDistribution.map((s) => [s._id, s.count]));
        const wonDeals = stageCountMap.Won || 0;
        const lostDeals = stageCountMap.Lost || 0;
        const totalDeals = base.totalDeals || 0;
        const openDeals = Math.max(0, totalDeals - wonDeals - lostDeals);
        const winRate = totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(1)) : 0;

        res.status(200).json({
            workspace: scope === 'global' ? { _id: null, name: 'All your workspaces' } : undefined,
            summary: {
                ...base,
                openDeals,
                wonDeals,
                lostDeals,
                winRate
            },
            stageDistribution,
            stageCounts: stageCountMap,
            growthData: growthData.map((d) => ({
                name: new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'short' }),
                deals: d.count,
                value: d.value
            })),
            topDeals,
            revenueByWorkspace,
            assigneeDistribution
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching report stats', error: error.message });
    }
};
