// controllers/emailController.js
const { sendEmail } = require('../utils/emailSender');
const { WEBSITE_NAME } = require('../utils/constants');


const emailController = {
  /**
   * Handles the request to send a Contact Us confirmation email.
   * Expects: { userEmail, userName, userMessage } in req.body
   */
  sendContactUsEmail: async (req, res) => {
    const { userEmail, userName, userMessage } = req.body;

    if (!userEmail || !userName || !userMessage) {
      return res.status(400).json({ message: 'Missing required fields for contact us email: userEmail, userName, userMessage.' });
    }

    // --- 1. Email to the User (Confirmation) ---
    const userConfirmationSubject = 'Thank You for Contacting Us!';
    const userConfirmationHtml = `
      <p>Dear ${userName},</p>
      <p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p>
      <p>Here's a copy of your message:</p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin: 10px 0;">
        <p><em>"${userMessage}"</em></p>
      </blockquote>
      <p>Sincerely,</p>
      <p>The ${WEBSITE_NAME} Team</p>
      <p><small>This is an automated message, please do not reply directly to this email.</small></p>
    `;
    const userConfirmationText = `Dear ${userName},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nHere's a copy of your message:\n"${userMessage}"\n\nSincerely,\nThe ${WEBSITE_NAME} Team\n\nThis is an automated message, please do not reply directly to this email.`;

    // --- 2. Email to Your Internal Team (The actual inquiry) ---
    const internalSubject = `New Contact Us Inquiry from ${userName}`;
    const internalHtml = `
      <p>You have received a new contact form submission:</p>
      <ul>
        <li><strong>Name:</strong> ${userName}</li>
        <li><strong>Email:</strong> ${userEmail}</li>
      </ul>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin: 10px 0;">
        <p><em>"${userMessage}"</em></p>
      </blockquote>
      <p>Please respond to ${userEmail} as soon as possible.</p>
    `;
    const internalText = `New Contact Us Inquiry from ${userName}\n\nName: ${userName}\nEmail: ${userEmail}\n\nMessage:\n"${userMessage}"\n\nPlease respond to ${userEmail} as soon as possible.`;

    try {
      // Send confirmation to the user
      await sendEmail(userEmail, userConfirmationSubject, userConfirmationHtml, userConfirmationText);

      // Send inquiry to your internal team
      if (process.env.MY_EMAIL) { // Ensure ADMIN_EMAIL is set
        await sendEmail(process.env.MY_EMAIL, internalSubject, internalHtml, internalText);
      } else {
        console.warn('ADMIN_EMAIL environment variable is not set. Internal contact form notification was not sent.');
      }

      res.status(200).json({ message: 'Contact Us confirmation email sent successfully, and internal notification sent.' });
    } catch (error) {
      console.error('Error sending contact us email(s):', error.message);
      res.status(500).json({ message: 'Failed to send contact us confirmation email or internal notification.', error: error.message });
    }
},

  /**
   * Handles the request to send a Registration Verification email.
   * Expects: { userEmail, userName, verificationLink } in req.body
   */
  sendRegistrationVerificationEmail: async (req, res) => {
    const { userEmail, userName, verificationLink } = req.body;

    if (!userEmail || !userName || !verificationLink) {
      return res.status(400).json({ message: 'Missing required fields for registration verification email: userEmail, userName, verificationLink.' });
    }

    const subject = `Verify Your Email Address for ${WEBSITE_NAME} Account`;
    const html = `
      <p>Hello ${userName},</p>
      <p>Welcome to ${WEBSITE_NAME}! Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify My Email</a></p>
      <p>This link will expire soon. If you did not create an account, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The ${WEBSITE_NAME} Team</p>
    `;
    const text = `Hello ${userName},\n\nWelcome to ${WEBSITE_NAME}! Please verify your email address by visiting the link below:\n${verificationLink}\n\nThis link will expire soon. If you did not create an account, please ignore this email.\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

    try {
      await sendEmail(userEmail, subject, html, text);
      res.status(200).json({ message: 'Registration verification email sent successfully!' });
    } catch (error) {
      console.error('Error sending registration verification email:', error.message);
      res.status(500).json({ message: 'Failed to send registration verification email.', error: error.message });
    }
  },

  /**
   * Handles the request to send a Course Completion email.
   * Expects: { userEmail, userName, courseName, certificateLink, surveyLink } in req.body
   */
  sendCourseCompletionEmail: async (req, res) => {
    const { userEmail, userName, courseName, certificateLink, surveyLink } = req.body;

    if (!userEmail || !userName || !courseName || !certificateLink || !surveyLink) {
      return res.status(400).json({ message: 'Missing required fields for course completion email: userEmail, userName, courseName, certificateLink, surveyLink.' });
    }

    const subject = `Congratulations on Completing ${courseName}!`;
    const html = `
      <p>Dear ${userName},</p>
      <p>Congratulations on successfully completing the course: <strong>${courseName}</strong>!</p>
      <p>We are incredibly proud of your achievement.</p>
      <p>You can view and download your certificate here: <a href="${certificateLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">View Certificate</a></p>
      <p>We would also appreciate it if you could take a few moments to provide feedback on the course:</p>
      <p><a href="${surveyLink}" style="display: inline-block; padding: 10px 20px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 5px;">Take Course Survey</a></p>
      <p>Keep learning and growing!</p>
      <p>Best regards,</p>
      <p>The ${WEBSITE_NAME} Team</p>
    `;
    const text = `Dear ${userName},\n\nCongratulations on successfully completing the course: ${courseName}!\n\nWe are incredibly proud of your achievement.\n\nYou can view and download your certificate here: ${certificateLink}\n\nWe would also appreciate it if you could take a few moments to provide feedback on the course: ${surveyLink}\n\nKeep learning and growing!\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

    try {
      await sendEmail(userEmail, subject, html, text);
      res.status(200).json({ message: 'Course completion email sent successfully!' });
    } catch (error) {
      console.error('Error sending course completion email:', error.message);
      res.status(500).json({ message: 'Failed to send course completion email.', error: error.message });
    }
  },

  /**
   * Handles the request to send a Course Purchase confirmation email.
   * Expects: { userEmail, userName, courseName, orderId, purchaseDetails } in req.body
   */
  sendCoursePurchaseEmail: async (req, res) => {
    const { userEmail, userName, courseName, orderId, purchaseDetails } = req.body;

    if (!userEmail || !userName || !courseName || !orderId || !purchaseDetails) {
      return res.status(400).json({ message: 'Missing required fields for course purchase email: userEmail, userName, courseName, orderId, purchaseDetails.' });
    }

    const subject = `Your Course Purchase Confirmation - Order #${orderId}`;
    const html = `
      <p>Dear ${userName},</p>
      <p>Thank you for your purchase!</p>
      <p>We're excited to confirm your enrollment in the course: <strong>${courseName}</strong>.</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>Purchase Details:</strong></p>
      <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto;"><code>${JSON.stringify(purchaseDetails, null, 2)}</code></pre>
      <p>You can now access your course by logging into your account.</p>
      <p>Happy learning!</p>
      <p>Best regards,</p>
      <p>The ${WEBSITE_NAME} Team</p>
    `;
    const text = `Dear ${userName},\n\nThank you for your purchase!\n\nWe're excited to confirm your enrollment in the course: ${courseName}.\n\nOrder ID: #${orderId}\n\nPurchase Details:\n${JSON.stringify(purchaseDetails, null, 2)}\n\nYou can now access your course by logging into your account.\n\nHappy learning!\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

    try {
      await sendEmail(userEmail, subject, html, text);
      res.status(200).json({ message: 'Course purchase confirmation email sent successfully!' });
    } catch (error) {
      console.error('Error sending course purchase email:', error.message);
      res.status(500).json({ message: 'Failed to send course purchase confirmation email.', error: error.message });
    }
  },

  /**
   * Handles the request to send a Forgot Password email.
   * Expects: { userEmail, userName, resetLink } in req.body
   */
  sendForgotPasswordEmail: async (req, res) => {
    const { userEmail, userName, resetLink } = req.body;

    if (!userEmail || !userName || !resetLink) {
      return res.status(400).json({ message: 'Missing required fields for forgot password email: userEmail, userName, resetLink.' });
    }

    const subject = `Password Reset Request for ${WEBSITE_NAME} Account`;
    const html = `
      <p>Hello ${userName},</p>
      <p>We received a request to reset the password for your account.</p>
      <p>Please click on the link below to reset your password:</p>
      <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset My Password</a></p>
      <p>This link will expire in [e.g., 1 hour]. If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The ${WEBSITE_NAME} Team</p>
    `;
    const text = `Hello ${userName},\n\nWe received a request to reset the password for your account.\n\nPlease click on the link below to reset your password:\n${resetLink}\n\nThis link will expire in [e.g., 1 hour]. If you did not request a password reset, please ignore this email.\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

    try {
      await sendEmail(userEmail, subject, html, text);
      res.status(200).json({ message: 'Forgot password email sent successfully!' });
    } catch (error) {
      console.error('Error sending forgot password email:', error.message);
      res.status(500).json({ message: 'Failed to send forgot password email.', error: error.message });
    }
  }
};

module.exports = emailController;
