const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    uploadDocument,
    getWorkspaceDocuments,
    deleteDocument,
    downloadDocument
} = require('../controllers/documentController');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/workspace/:workspaceId', protect, getWorkspaceDocuments);
router.delete('/:id', protect, deleteDocument);
router.get('/download/:id', protect, downloadDocument);

module.exports = router;
