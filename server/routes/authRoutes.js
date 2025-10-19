// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust path

// POST /api/register
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
// Route to request a password reset link
router.post('/forgot-password', authController.forgotPassword);

// Route to actually reset the password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
