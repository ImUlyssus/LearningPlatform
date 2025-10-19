// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController'); // Path to your backend email controller

// Note: Authentication/Authorization middleware can be added here as needed.
// For example, some routes might require a user to be logged in (authMiddleware)
// or have specific roles (authorizeRoles).
// I'll add comments where you might typically apply them.

/**
 * @route POST /api/email/contact-us
 * @description Triggers sending a confirmation email to the user who submitted a contact form.
 * @access Public (usually, as anyone can submit a contact form)
 */
router.post('/contact-us', emailController.sendContactUsEmail);

/**
 * @route POST /api/email/registration-verification
 * @description Triggers sending an email with a verification code/link for new registrations.
 * @access Public (part of the registration process)
 */
router.post('/registration-verification', emailController.sendRegistrationVerificationEmail);

/**
 * @route POST /api/email/course-completion
 * @description Triggers sending a congratulatory email for course completion with certificate and survey links.
 * @access Private (e.g., requires authentication, or triggered by backend internal logic,
 *                   so the API call might come from an authenticated admin or an internal system,
 *                   or a user's authenticated request after course completion is verified)
 * // Example with middleware: router.post('/course-completion', authMiddleware, emailController.sendCourseCompletionEmail);
 */
router.post('/course-completion', emailController.sendCourseCompletionEmail); // Add authMiddleware if needed

/**
 * @route POST /api/email/course-purchase
 * @description Triggers sending a confirmation email after a successful course purchase.
 * @access Private (e.g., requires authentication, or triggered by backend internal logic after payment)
 * // Example with middleware: router.post('/course-purchase', authMiddleware, emailController.sendCoursePurchaseEmail);
 */
router.post('/course-purchase', emailController.sendCoursePurchaseEmail); // Add authMiddleware if needed

/**
 * @route POST /api/email/forgot-password
 * @description Triggers sending an email with a password reset link.
 * @access Public (anyone who forgot their password can request this)
 */
router.post('/forgot-password', emailController.sendForgotPasswordEmail);

module.exports = router;
