// controllers/userController.js
const bcrypt = require('bcryptjs');
const { User, Enrolled_Courses, Saved_Courses, Certificates } = require('../models');
const { ROLES } = require('../utils/constants');

const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
const LECTURER_ROLE = ROLES.LECTURER;

const userController = {
  // Get user profile (already somewhat covered by /user/profile route example)
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] } // Exclude password from the response
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json(user);
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
      res.status(500).json({ message: 'Server Error fetching profile.' });
    }
  },

  // Update Personal Information
  updatePersonalInfo: async (req, res) => {
    const { name, birthYear, city, gender } = req.body;
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Basic validation
      if (!name || !birthYear) { // Name and birthYear are required
        return res.status(400).json({ message: 'Name and Birth Year are required.' });
      }
      if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
        return res.status(400).json({ message: 'Invalid birth year.' });
      }
      if (gender && !['Male', 'Female', 'Other', null].includes(gender)) {
        return res.status(400).json({ message: 'Invalid gender value.' });
      }

      user.username = name;
      user.birth_year = birthYear;
      user.city = city || null; // Allow setting to null if empty
      user.gender = gender || null; // Allow setting to null if empty

      await user.save();

      res.json({
        message: 'Personal information updated successfully!',
        user: { id: user.id, name: user.name, email: user.email, birthYear: user.birthYear, city: user.city, gender: user.gender }
      });
    } catch (err) {
      console.error('Error updating personal info:', err.message);
      res.status(500).json({ message: 'Server Error updating personal information.' });
    }
  },

  // Update Email
  updateEmail: async (req, res) => {
    const { currentPassword, newEmail } = req.body;
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // 1. Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }

      // 2. Validate new email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!newEmail || !emailRegex.test(newEmail)) {
        return res.status(400).json({ message: 'Invalid new email format.' });
      }

      // 3. Check if new email is already in use by another user
      if (newEmail !== user.email) {
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
          return res.status(400).json({ message: 'This email is already in use.' });
        }
      } else {
          return res.status(400).json({ message: 'New email cannot be the same as current email.' });
      }

      // 4. Update email
      user.email = newEmail;
      await user.save();

      // In a real app, you'd send a verification email to newEmail here.
      // For now, we're directly updating it.

      res.json({ message: 'Email updated successfully!', newEmail: user.email });
    } catch (err) {
      console.error('Error updating email:', err.message);
      res.status(500).json({ message: 'Server Error updating email.' });
    }
  },

  // Update Password
  updatePassword: async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // 1. Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password.' });
      }

      // 2. Validate new password
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New passwords do not match.' });
      }

      // 3. Prevent changing to the same password (optional but good practice)
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
      }

      // 4. Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // 5. Save updated password
      await user.save();

      res.json({ message: 'Password updated successfully!' });
    } catch (err) {
      console.error('Error updating password:', err.message);
      res.status(500).json({ message: 'Server Error updating password.' });
    }
  },
  /**
   * @route GET /users/search?email=<email>
   * @description Search for a user by email address.
   * @access Private (e.g., only accessible by admins/managers)
   */
  findUserByEmail: async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required.' });
      }

      const user = await User.findOne({
        where: { email: email },
        attributes: ['id', 'username', 'email', 'user_role', 'profile_url', 'one_yr_membership', 'membership_start_date'] // Include necessary user details
      });

      if (!user) {
        return res.status(404).json({ message: 'No user found with that email.' });
      }

      // The frontend expects a 'user' object within the data
      res.json({ user: user });
    } catch (err) {
      console.error('Error searching user by email:', err.message);
      res.status(500).json({ message: 'Server Error searching for user.' });
    }
  },

  /**
   * @route POST /managers
   * @description Update a user's role to Manager.
   * @access Private (e.g., only accessible by admins)
   */
  addManagerRole: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to add a manager.' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      // NEW CHECK: Deny if the user is an Administrator
      if (user.user_role === ADMIN_ROLE) {
        return res.status(403).json({ message: 'Cannot change the role of an Administrator.' });
      }
      // Check if user is already a manager to avoid unnecessary updates
      if (user.user_role === MANAGER_ROLE) {
        return res.status(409).json({ message: 'User is already a manager.' }); // 409 Conflict
      }

      user.user_role = MANAGER_ROLE; // Use the value from environment variable
      await user.save();

      res.status(200).json({
        message: 'User role updated to manager.',
        manager: { id: user.id, name: user.username, email: user.email, user_role: user.user_role }
      });
    } catch (err) {
      console.error('Error adding manager role:', err.message);
      res.status(500).json({ message: 'Server Error updating user role to manager.' });
    }
  },

  /**
   * @route POST /lecturers
   * @description Update a user's role to Lecturer.
   * @access Private (e.g., only accessible by admins)
   */
  addLecturerRole: async (req, res) => {
    try {
      const { userId } = req.body;
      console.log("Received request to add lecturer role to userId:", userId);

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to add a lecturer.' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      // NEW CHECK: Deny if the user is an Administrator
      if (user.user_role === ADMIN_ROLE) {
        return res.status(403).json({ message: 'Cannot change the role of an Administrator.' });
      }
      // Check if user is already a lecturer
      if (user.user_role === LECTURER_ROLE) {
        return res.status(409).json({ message: 'User is already a lecturer.' });
      }

      user.user_role = LECTURER_ROLE; // Use the value from environment variable
      await user.save();

      res.status(200).json({
        message: 'User role updated to lecturer.',
        lecturer: { id: user.id, name: user.username, email: user.email, user_role: user.user_role }
      });
    } catch (err) {
      console.error('Error adding lecturer role:', err.message);
      res.status(500).json({ message: 'Server Error updating user role to lecturer.' });
    }
  },
  /**
   * @route PUT /managers/remove
   * @description Demote a user from Manager to Normal User.
   * @access Private (e.g., only accessible by admins)
   */
  removeManagerRole: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to remove manager role.' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check if user is already a normal user to avoid unnecessary updates
      if (user.user_role === NORMAL_ROLE) {
        return res.status(409).json({ message: 'User is already a normal user.' });
      }

      user.user_role = NORMAL_ROLE;
      await user.save();

      res.status(200).json({
        message: 'User demoted from manager role to normal user.',
        user: { id: user.id, username: user.username, email: user.email, user_role: user.user_role }
      });
    } catch (err) {
      console.error('Error removing manager role:', err.message);
      res.status(500).json({ message: 'Server Error removing manager role.' });
    }
  },

  /**
   * @route PUT /lecturers/remove
   * @description Demote a user from Lecturer to Normal User.
   * @access Private (e.g., only accessible by admins/managers)
   */
  removeLecturerRole: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required to remove lecturer role.' });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check if user is already a normal user
      if (user.user_role === NORMAL_ROLE) {
        return res.status(409).json({ message: 'User is already a normal user.' });
      }

      user.user_role = NORMAL_ROLE;
      await user.save();

      res.status(200).json({
        message: 'User demoted from lecturer role to normal user.',
        user: { id: user.id, username: user.username, email: user.email, user_role: user.user_role }
      });
    } catch (err) {
      console.error('Error removing lecturer role:', err.message);
      res.status(500).json({ message: 'Server Error removing lecturer role.' });
    }
  },
  // NEW: Get all users with the manager role
  getManagers: async (req, res) => {
    try {
      const managers = await User.findAll({
        where: {
          user_role: MANAGER_ROLE
        },
        attributes: ['id', 'username', 'email', 'user_role'] // Select specific fields
      });
      res.status(200).json({ managers });
    } catch (err) {
      console.error('Error fetching managers:', err.message);
      res.status(500).json({ message: 'Server Error fetching managers.' });
    }
  },

  // NEW: Get all users with the lecturer role
  getLecturers: async (req, res) => {
    try {
      const lecturers = await User.findAll({
        where: {
          user_role: LECTURER_ROLE
        },
        attributes: ['id', 'username', 'email', 'user_role'] // Select specific fields
      });
      res.status(200).json({ lecturers });
    } catch (err) {
      console.error('Error fetching lecturers:', err.message);
      res.status(500).json({ message: 'Server Error fetching lecturers.' });
    }
  },
  /**
   * @route PUT /api/users/:id
   * @description Update user details (e.g., membership status)
   * @access Private (Admin, Manager)
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { one_yr_membership, membership_start_date } = req.body; // Specifically target these fields

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Only allow specific fields to be updated by this route for security
      const updateFields = {};
      if (typeof one_yr_membership === 'boolean') {
        updateFields.one_yr_membership = one_yr_membership;
      }
      if (membership_start_date !== undefined) { // Allow setting to null
        updateFields.membership_start_date = membership_start_date;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
      }

      await user.update(updateFields);

      res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ message: 'Server error updating user.', error: error.message });
    }
  },
  getCurrentUser: async (req, res) => {
    console.log("I got here.")
    try {
      // req.user.id is populated by your authentication middleware
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] } // Exclude sensitive password hash
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Fetch additional user-specific data
      const enrolledCourses = await Enrolled_Courses.findAll({
        where: { user_id: userId },
        attributes: ['course_id', 'enrolled_date', 'completed', 'quizzes_info']
      });

      const savedCourses = await Saved_Courses.findAll({
        where: { user_id: userId },
        attributes: ['course_id']
      });

      const certificates = await Certificates.findAll({
        where: { user_id: userId },
        attributes: ['id', 'course_id', 'completed_date', 'score']
      });

      // Respond with the comprehensive user data
      res.json({
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
      });

    } catch (error) {
      console.error('Error fetching current user data:', error);
      res.status(500).json({ message: 'Server Error fetching user data.' });
    }
  },
};

module.exports = userController;
