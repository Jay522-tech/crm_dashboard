const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Email', 'SMS', 'WhatsApp', 'Call'],
        required: true
    },
    direction: {
        type: String,
        enum: ['Inbound', 'Outbound'],
        default: 'Outbound'
    },
    subject: String,
    content: String,
    status: {
        type: String,
        enum: ['Sent', 'Delivered', 'Received', 'Failed', 'Pending'],
        default: 'Sent'
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    dealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal'
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Communication', communicationSchema);
