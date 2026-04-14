const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['Call', 'Meeting', 'Email', 'Follow-up', 'Task'],
        default: 'Follow-up'
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Done', 'Cancelled'],
        default: 'Scheduled'
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    notes: { type: String, trim: true },
    reminderSentAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

