// controllers/authController.js (Update this file)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Node.js built-in module for generating tokens
const { User, Saved_Courses, Enrolled_Courses, Certificates } = require('../models');
const { sendEmail } = require('../utils/emailSender'); // Import the email utility
const { WEBSITE_NAME } = require('../utils/constants')
const { Op } = require('sequelize');
require('dotenv').config();
const env = process.env.NODE_ENV || 'development'; 
const config = require(__dirname + '/../config/config.js')[env];

const authController = {
  register: async (req, res) => {
    const { username, email, password, birth_year } = req.body;

    // 1. Basic Validation
    if (!username || !email || !password || !birth_year) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // 2. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // 3. Password Strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
      // 4. Check if user already exists (verified or unverified)
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (existingUser.isVerified) {
          return res.status(400).json({ message: 'Email already registered and verified.' });
        } else {
          // If unverified, you might want to resend email or prompt user to check inbox
          return res.status(400).json({ message: 'Email already registered but not verified. Please check your email for the verification link.' });
        }
      }

      // 5. Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 6. Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex'); // Generate a random token
      const verificationTokenExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // 7. Create the new user in the database (initially unverified)
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        birth_year,
        isVerified: false, // User is not verified yet
        verificationToken: verificationToken,
        verificationTokenExpires: verificationTokenExpires,
      });

      // 8. Construct verification link for email
      // Ensure process.env.FRONTEND_URL is set in your .env file (e.g., http://localhost:3000)
      if (!config.frontend_url) {
          console.error("FRONTEND_URL environment variable is not set. Email verification link will be incomplete.");
          // You might want to delete the created user or mark it for manual review
          await newUser.destroy(); // Rollback user creation if email sending is critical
          return res.status(500).json({ message: 'Server configuration error: FRONTEND_URL is missing.' });
      }
      const verificationLink = `${config.frontend_url}/verify-email?token=${verificationToken}`;

      // 9. Send verification email
      const subject = `Verify Your Email Address for ${WEBSITE_NAME} Account`;
      const html = `
        <p>Hello ${username},</p>
        <p>Welcome to ${WEBSITE_NAME}! Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify My Email</a></p>
        <p>This link will expire in 1 hour. If you did not create an account, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The ${WEBSITE_NAME} Team</p>
      `;
      const text = `Hello ${username},\n\nWelcome to ${WEBSITE_NAME}! Please verify your email address by visiting the link below:\n${verificationLink}\n\nThis link will expire in 1 hour. If you did not create an account, please ignore this email.\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

      await sendEmail(email, subject, html, text);

      // 10. Respond with success (user created, email sent)
      res.status(201).json({
        message: 'User registered successfully! Please check your email to verify your account.',
        // Do not send sensitive user data or tokens back to the frontend here
      });

    } catch (error) {
      console.error('Error during user registration:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Email or username already registered.' });
      }
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      // If email sending failed after user creation, you might want to handle rollback or retry
      if (error.message.includes('Failed to send email')) {
          // If you want to delete the user if email failed, uncomment the following:
          // await User.destroy({ where: { email: email } }); // Or use newUser.destroy() if newUser was available
          return res.status(500).json({ message: 'Registration successful, but failed to send verification email. Please contact support.' });
      }
      res.status(500).json({ message: 'Server error during registration.' });
    }
  },

  // --- NEW FUNCTION: handle email verification ---
  verifyEmail: async (req, res) => {
    const { token } = req.query; // Token comes from the URL query parameter

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing.' });
    }

    try {
      const user = await User.findOne({ where: { verificationToken: token } });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token.' });
      }

      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }

      // Check if token has expired
      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        // Optionally, generate a new token and resend email here
        return res.status(400).json({ message: 'Verification token has expired. Please register again or request a new verification email.' });
      }

      // Mark user as verified and clear token fields
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      await user.save();

      res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
      console.error('Error during email verification:', error);
      res.status(500).json({ message: 'Server error during email verification.' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      // 2. Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // 3. Check if user is verified before allowing login
      if (!user.isVerified) {
          return res.status(403).json({ message: 'Please verify your email address to log in.' });
      }

      // 4. Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // 5. Fetch additional user-specific data (only for verified users)
      const enrolledCourses = await Enrolled_Courses.findAll({
        where: { user_id: user.id },
        attributes: ['course_id', 'enrolled_date', 'completed', 'quizzes_info']
      });

      const savedCourses = await Saved_Courses.findAll({
        where: { user_id: user.id },
        attributes: ['course_id']
      });

      const certificates = await Certificates.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'course_id', 'completed_date', 'score']
      });

      // 6. Generate JWT
      const payload = {
        user: {
          id: user.id,
          // You can add other non-sensitive user data to the payload if needed
          // e.g., role: user.role
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '30d' },
        (err, token) => {
          if (err) throw err;
          // 7. Respond with the token, user data, and the newly fetched data
          res.json({
            message: 'Login successful!',
            token,
            user: {
              id: user.id,
              name: user.username,
              email: user.email,
              birthYear: user.birth_year,
              user_role: user.user_role,
              one_yr_membership: user.one_yr_membership,
              membership_start_date: user.membership_start_date,
              enrolled_courses: enrolledCourses,
              saved_courses: savedCourses,
              certificates: certificates
            },
          });
        }
      );

    } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  },
  /**
   * @route POST /api/auth/forgot-password
   * @description Handles the request to send a password reset link to the user's email.
   * @access Public
   */
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    try {
      const user = await User.findOne({ where: { email } });

      // Important for security: Always send a generic success message
      // even if the email is not found. This prevents email enumeration attacks.
      if (!user) {
        return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Generate a unique reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour (3600000 ms)

      // Save the token and expiry to the user record
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Construct the full reset link for the email
      // Ensure process.env.FRONTEND_URL is set in your backend's .env file (e.g., http://localhost:3000)
      if (!config.frontend_url) {
          console.error("FRONTEND_URL environment variable is not set. Password reset link will be incomplete.");
          return res.status(500).json({ message: 'Server configuration error: FRONTEND_URL is missing.' });
      }
      const resetLink = `${config.frontend_url}/reset-password?token=${resetToken}`; // Assuming frontend route is /reset-password

      // Send the password reset email
      const subject = `Password Reset Request for your ${WEBSITE_NAME} Account`;
      const html = `
        <p>Hello ${user.username || user.email},</p>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset My Password</a></p>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,</p>
        <p>The ${WEBSITE_NAME} Team</p>
      `;
      const text = `Hello ${user.username || user.email},\n\nYou are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n${resetLink}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

      await sendEmail(email, subject, html, text);

      res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
      console.error('Error during forgot password request:', error);
      res.status(500).json({ message: 'Server error during password reset request.' });
    }
  },

  /**
   * @route POST /api/auth/reset-password
   * @description Resets the user's password using a valid token and new password.
   * @access Public
   */
  resetPassword: async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Basic password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one letter and one number.' });
    }

    try {
      // Find user by token and check if token has not expired
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() } // Op.gt means "greater than" (i.e., not expired)
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user's password and clear reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({ message: 'Password has been reset successfully!' });

    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ message: 'Server error during password reset.' });
    }
  },
};

module.exports = authController;
