// routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/constants');

const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
const UPLOAD_ROLES = [ADMIN_ROLE, MANAGER_ROLE];

// @route   POST /api/files/upload
// @desc    Uploads a file to a specific hierarchical path
// @access  Private (Admin/Manager)
// IMPORTANT: Multer logic is wrapped inside fileController.uploadFile, as per your old working code.
// The order of auth middleware before the controller function is fine here.
router.post('/upload', authMiddleware, authorizeRoles(UPLOAD_ROLES), fileController.uploadFile);

// @route   DELETE /api/files/delete
// @desc    Deletes a file given its path
// @access  Private (Admin/Manager)
router.delete('/delete', authMiddleware, authorizeRoles(UPLOAD_ROLES), fileController.deleteFile);

// @route   GET /api/files/stream/:fileId/:fileType
// @desc    Streams a file given its ID and general type (e.g., 'video', 'image', 'pdf', 'zip')
// @access  Public
router.get('/stream/:fileId/:fileType', fileController.streamFile);

// --- UPDATED ROUTE FOR USER/LECTURER IMAGES ---
// @route   POST /api/files/upload-entity-image/:id/:entityType
// @desc    Uploads an image for a user or lecturer, using their ID as filename
// @access  Private (Admin/Manager)
router.post('/upload-entity-image/:id/:entityType', authMiddleware, fileController.uploadEntityImage); // <--- UPDATED

// @route   GET /api/files/stream-entity-image/:id/:entityType
// @desc    Streams an image for a user or lecturer
// @access  Public
router.get('/stream-entity-image/:id/:entityType', fileController.streamEntityImage);

module.exports = router;

