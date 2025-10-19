// controllers/LecturerController.js
const { Lecturer } = require('../models');

const LecturerController = {
  /**
   * @route GET /api/lecturers
   * @description Get all active (non-deleted) lecturers
   * @access Private (Admin, Manager)
   */
  getAllLecturers: async (req, res) => {
    try {
      // Assuming you want to fetch all lecturers (active and deleted) and filter on frontend
      // If you only want non-deleted by default, keep the 'where: { is_deleted: false }'
      const lecturers = await Lecturer.findAll({
        // where: {
        //   is_deleted: false // Uncomment this line if you only want non-deleted lecturers by default for this endpoint
        // },
        attributes: ['id', 'username', 'email', 'phone', 'bio', 'can_share_info', 'profile_url', 'is_deleted', 'createdAt', 'updatedAt'], // Include is_deleted for frontend filtering
        order: [['username', 'ASC']] // Order by username alphabetically
      });
      res.status(200).json({ lecturers });
    } catch (error) {
      console.error('Error fetching lecturers:', error.message);
      res.status(500).json({ message: 'Server error fetching lecturers.', error: error.message });
    }
  },

  /**
   * @route GET /api/lecturers/:id
   * @description Get a single lecturer by ID
   * @access Private (Admin, Manager)
   */
  getLecturerById: async (req, res) => {
    try {
      const { id } = req.params;
      const lecturer = await Lecturer.findOne({
        where: {
          id: id,
          // is_deleted: false // Uncomment if you don't want to retrieve deleted lecturers by ID
        },
        attributes: ['id', 'username', 'email', 'phone', 'bio', 'can_share_info', 'profile_url', 'is_deleted', 'createdAt', 'updatedAt'],
      });

      if (!lecturer) {
        return res.status(404).json({ message: 'Lecturer not found.' }); // Simplified message, as it might be deleted
      }

      res.status(200).json({ lecturer });
    } catch (error) {
      console.error('Error fetching lecturer by ID:', error.message);
      res.status(500).json({ message: 'Server error fetching lecturer.', error: error.message });
    }
  },

  /**
   * @route POST /api/lecturers
   * @description Create a new lecturer
   * @access Private (Admin)
   */
  createLecturer: async (req, res) => {
    try {
      const { username, email, phone, bio, can_share_info } = req.body;

      // Basic validation
      if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required.' });
      }

      // Check if lecturer with this email already exists (even if deleted)
      const existingLecturer = await Lecturer.findOne({ where: { email: email } });
      if (existingLecturer) {
        // If it exists and is deleted, perhaps offer to restore or prevent creation
        if (existingLecturer.is_deleted) {
          return res.status(409).json({ message: 'A lecturer with this email already exists but is marked as deleted. Consider restoring them.' });
        }
        return res.status(409).json({ message: 'A lecturer with this email already exists.' });
      }

      const newLecturer = await Lecturer.create({
        username,
        email,
        phone: phone || '', // Use default if not provided
        bio: bio || '',     // Use default if not provided
        can_share_info: can_share_info !== undefined ? can_share_info : true, // Respect provided value, else default
        profile_url: null,
        is_deleted: false // Ensure it's not deleted on creation
      });

      res.status(201).json({ message: 'Lecturer created successfully!', lecturer: newLecturer });
    } catch (error) {
      console.error('Error creating lecturer:', error.message);
      res.status(500).json({ message: 'Server error creating lecturer.', error: error.message });
    }
  },

  /**
   * @route PUT /api/lecturers/:id
   * @description Update an existing lecturer
   * @access Private (Admin, Manager)
   */
  updateLecturer: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, phone, bio, can_share_info, profile_url } = req.body;

      const lecturer = await Lecturer.findByPk(id);

      if (!lecturer) {
        return res.status(404).json({ message: 'Lecturer not found.' });
      }

      // Do not allow updating if the lecturer is soft-deleted, unless it's a recovery operation
      if (lecturer.is_deleted) {
        return res.status(400).json({ message: 'Cannot update a soft-deleted lecturer. Recover them first.' });
      }

      // Check for email uniqueness if email is being updated and is different from current
      if (email && email !== lecturer.email) {
        const existingLecturerWithNewEmail = await Lecturer.findOne({ where: { email: email } });
        if (existingLecturerWithNewEmail && existingLecturerWithNewEmail.id !== lecturer.id) {
          return res.status(409).json({ message: 'Another lecturer with this email already exists.' });
        }
      }

      // Update fields, only if they are provided in the request body
      lecturer.username = username !== undefined ? username : lecturer.username;
      lecturer.email = email !== undefined ? email : lecturer.email;
      lecturer.phone = phone !== undefined ? phone : lecturer.phone;
      lecturer.bio = bio !== undefined ? bio : lecturer.bio;
      lecturer.can_share_info = can_share_info !== undefined ? can_share_info : lecturer.can_share_info;
      lecturer.profile_url = profile_url !== undefined ? profile_url : lecturer.profile_url;
      // is_deleted is handled by softDeleteLecturer, typically not updated directly here

      await lecturer.save();

      res.status(200).json({ message: 'Lecturer updated successfully!', lecturer });
    } catch (error) {
      console.error('Error updating lecturer:', error.message);
      res.status(500).json({ message: 'Server error updating lecturer.', error: error.message });
    }
  },

  /**
   * @route PUT /api/lecturers/:id/soft-delete
   * @description Soft delete a lecturer (sets is_deleted to true)
   * @access Private (Admin)
   */
  softDeleteLecturer: async (req, res) => {
    try {
      const { id } = req.params;

      const lecturer = await Lecturer.findByPk(id);

      if (!lecturer) {
        return res.status(404).json({ message: 'Lecturer not found.' });
      }

      // Prevent re-deleting an already deleted lecturer (optional)
      if (lecturer.is_deleted) {
        return res.status(409).json({ message: 'Lecturer is already soft-deleted.' });
      }

      lecturer.is_deleted = true;
      await lecturer.save();

      res.status(200).json({ message: 'Lecturer soft-deleted successfully!', lecturer });
    } catch (error) {
      console.error('Error soft deleting lecturer:', error.message);
      res.status(500).json({ message: 'Server error soft deleting lecturer.', error: error.message });
    }
  },

  /**
   * NEW FUNCTION
   * @route PUT /api/lecturers/:id/recover
   * @description Recover a soft-deleted lecturer (sets is_deleted to false)
   * @access Private (Admin)
   */
  recoverLecturer: async (req, res) => {
    try {
      const { id } = req.params;
      const lecturer = await Lecturer.findByPk(id);

      if (!lecturer) {
        return res.status(404).json({ message: 'Lecturer not found.' });
      }

      // Check if the lecturer is actually soft-deleted before attempting recovery
      if (!lecturer.is_deleted) {
        return res.status(409).json({ message: 'Lecturer is not currently soft-deleted.' });
      }

      lecturer.is_deleted = false; // Set is_deleted back to false
      await lecturer.save();

      res.status(200).json({ message: 'Lecturer recovered successfully!', lecturer });
    } catch (error) {
      console.error('Error recovering lecturer:', error.message);
      res.status(500).json({ message: 'Server error recovering lecturer.', error: error.message });
    }
  },
  /**
   * @route GET /api/lecturers/search?email=:email
   * @description Search for a lecturer by email
   * @access Private (Admin, Manager)
   */
  searchLecturerByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required.' });
      }
      console.log('Searching for lecturer with email:', email);

      const lecturer = await Lecturer.findOne({
        where: {
          email: email.toLowerCase()
        },
        attributes: ['id', 'username', 'email', 'profile_url'] // Include profile_url for the card
      });

      if (!lecturer) {
        return res.status(404).json({ message: 'No lecturer found with that email.' });
      }

      res.status(200).json({ lecturer });
    } catch (error) {
      console.error('Error searching lecturer by email:', error.message);
      res.status(500).json({ message: 'Server error searching lecturer.', error: error.message });
    }
  },
};

module.exports = LecturerController;
