// controllers/CertificateController.js
const { Certificates, Course, Sub_Course, User, Enrolled_Courses } = require('../models'); // Import User model
const { ROLES } = require('../utils/constants');


const ADMIN_ROLE = ROLES.ADMIN;
const certificateController = {
  /**
   * @route GET /api/certificates/:id
   * @description Get a single certificate by its ID, along with its associated course/sub-course details AND user info.
   *              Ensures the certificate belongs to the authenticated user or if the user is an admin.
   * @access Private (Owner or Admin)
   */
  getCertificateById: async (req, res) => {
    try {
      const { id } = req.params; // This 'id' is the certificate's unique ID

      const certificate = await Certificates.findByPk(id);

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found.' });
      }
      const userId = certificate.user_id;
      const courseId = certificate.course_id;
      // --- NEW: Check if the user is currently enrolled in this course ---
      const enrollment = await Enrolled_Courses.findOne({
        where: {
          user_id: userId,
          course_id: courseId,
        },
      });

      if (!enrollment) {
        // If no enrollment record is found, the user is not actively enrolled.
        // This implies the certificate is not viewable by them, or has been revoked due to unenrollment.
        return res.status(403).json({ message: 'Access denied. User is not currently enrolled in the associated course.' });
      }
      // --- Fetch Associated Course/Sub-Course Info ---
      let associatedCourse = null;

      // Determine if it's a main course or a sub-course based on hyphen count
      const hyphenCount = (courseId.match(/-/g) || []).length;

      if (hyphenCount === 3) {
        // It's a sub-course
        associatedCourse = await Sub_Course.findByPk(courseId);
        if (!associatedCourse) {
          console.warn(`Sub-course with ID ${courseId} not found for certificate ${id}.`);
        }
      } else if (hyphenCount === 2) {
        // It's a main course
        associatedCourse = await Course.findByPk(courseId);
        if (!associatedCourse) {
          console.warn(`Main course with ID ${courseId} not found for certificate ${id}.`);
        }
      } else {
        console.warn(`Unexpected course_id format for certificate ${id}: ${courseId}. Cannot determine course type.`);
      }

      // --- Fetch User Info ---
      const user = await User.findByPk(certificate.user_id, {
        attributes: ['username', 'email', 'profile_url'] // Select only these specific attributes
      });

      if (!user) {
        console.warn(`User with ID ${certificate.user_id} not found for certificate ${id}.`);
        // You might decide to return an error here if a certificate must always have a linked user,
        // or just proceed with user as null.
      }

      // Send the certificate data, associated course/sub-course data, and user info
      res.status(200).json({
        certificate,
        courseInfo: associatedCourse, // Will be null if not found or type unrecognized
        userInfo: user // Will be null if user not found
      });

    } catch (error) {
      console.error('Error fetching certificate by ID:', error.message);
      res.status(500).json({ message: 'Server error fetching certificate.', error: error.message });
    }
  },

  /**
   * @route POST /api/certificates
   * @description Create a new certificate record.
   * @access Private (Admin only, or internal)
   */
  createCertificate: async (req, res) => {
    try {
      const { id, user_id, course_id, completed_date, score } = req.body;

      // Basic validation
      if (!id || !user_id || !course_id || !completed_date) {
        return res.status(400).json({ message: 'Missing required fields for certificate creation.' });
      }

      const newCertificate = await Certificates.create({
        id,
        user_id,
        course_id,
        completed_date: new Date(completed_date), // Ensure date format
        score: score || 0, // Default to 0 if not provided
      });

      res.status(201).json({
        message: 'Certificate created successfully!',
        certificate: newCertificate
      });

    } catch (error) {
      console.error('Error creating certificate:', error.message);
      res.status(500).json({ message: 'Server error while creating certificate.', error: error.message });
    }
  },

  /**
   * @route GET /api/certificates/user/:userId
   * @description Get all certificates for a specific user.
   *              Ensures the request is from the user themselves or an Admin.
   * @access Private (Owner or Admin)
   */
  getCertificatesByUserId: async (req, res) => {
    try {
      const { userId } = req.params; // The user ID from the URL
      const authenticatedUserId = req.user.id; // The ID of the authenticated user
      const userRole = req.user.role; // Role of the authenticated user

      // Only allow access if the requesting user is the target user or an admin
      if (String(userId) !== String(authenticatedUserId) && userRole !== ADMIN_ROLE) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view these certificates.' });
      }

      const certificates = await Certificates.findAll({
        where: { user_id: userId },
        order: [['completed_date', 'DESC']] // Order by most recent completion
      });

      if (!certificates || certificates.length === 0) {
        return res.status(404).json({ message: 'No certificates found for this user.' });
      }

      // Optionally, you could also fetch associated course info for each certificate here
      // if the frontend needs it for a list view, but for a single certificate view,
      // doing it in getCertificateById is more direct.

      res.status(200).json(certificates);
    } catch (error) {
      console.error('Error fetching certificates by user ID:', error.message);
      res.status(500).json({ message: 'Server error fetching user certificates.', error: error.message });
    }
  },
};

module.exports = certificateController;
