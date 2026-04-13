const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, default: 0 },
    stage: {
        type: String,
        enum: ['Lead', 'Contacted', 'Qualified', 'Won', 'Lost'],
        default: 'Lead'
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    contact: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    notes: [{
        content: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
