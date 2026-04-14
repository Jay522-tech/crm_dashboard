const mongoose = require('mongoose');

const matterSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    title: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Review', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    dueAt: { type: Date },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    reminderSentAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Matter', matterSchema);

