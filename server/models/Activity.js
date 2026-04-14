const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['DEAL', 'CONTACT', 'EVENT', 'MATTER', 'WORKSPACE', 'AUTH'],
        required: true
    },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String, trim: true },
    metadata: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

