const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { workspaceId, contactId, dealId, matterId, tags, folder } = req.body;

        if (!workspaceId) {
            // Delete the uploaded file if workspaceId is missing
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        const document = await Document.create({
            name: req.body.name || req.file.originalname,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            workspaceId,
            contactId: contactId || undefined,
            dealId: dealId || undefined,
            matterId: matterId || undefined,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            folder: folder || 'Root',
            uploadedBy: req.user._id
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Upload Error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
};

// @desc    Get all documents for a workspace
// @route   GET /api/documents/workspace/:workspaceId
// @access  Private
exports.getWorkspaceDocuments = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const documents = await Document.find({ workspaceId })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.path)) {
            fs.unlinkSync(document.path);
        }

        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
};

// @desc    Download/Get document file
// @route   GET /api/documents/download/:id
// @access  Private
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.path)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(document.path, document.originalName);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
};
