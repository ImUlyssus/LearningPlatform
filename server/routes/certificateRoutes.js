// routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming you have this middleware
const authMiddleware = require('../middleware/authMiddleware');     // Assuming you have this middleware

// @route   GET /api/certificates/:id
// @desc    Get a single certificate by ID
// @access  Private (accessible by the certificate owner or Admin)
router.get('/:id', certificateController.getCertificateById);

// @route   POST /api/certificates
// @desc    Create a new certificate (typically triggered by a course completion event)
// @access  Private (Admin only, or internal service-to-service)
// For simplicity, making it Admin only for now, but in a real app, this might be
// an internal API call or part of a completion webhook.
router.post('/', authMiddleware, certificateController.createCertificate);

// @route   GET /api/certificates/user/:userId
// @desc    Get all certificates for a specific user
// @access  Private (accessible by the user themselves or Admin)
router.get('/user/:userId', authMiddleware, certificateController.getCertificatesByUserId);


module.exports = router;
