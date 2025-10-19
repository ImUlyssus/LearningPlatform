// controllers/LecturerMapController.js
const { Lecturers_Map, Lecturer, Sub_Course } = require('../models');

const lecturerMapController = {
  /**
   * @route GET /api/lecturermaps
   * @description Get all lecturer-course mappings.
   * @access Private
   */
  getAllLecturerMaps: async (req, res) => {
    try {
      const mappings = await Lecturers_Map.findAll({
        order: [['course_id', 'ASC']] // Example: order by course ID
      });
      res.status(200).json(mappings);
    } catch (error) {
      console.error('Error fetching all lecturer-course mappings:', error.message);
      res.status(500).json({ message: 'Server error fetching mappings.', error: error.message });
    }
  },

  /**
   * @route GET /api/lecturermaps/:id
   * @description Get a single lecturer-course mapping by its primary key ID.
   * @access Private
   */
  getLecturerMapById: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Fetch the Lecturers_Map entry
      const mapping = await Lecturers_Map.findByPk(id);

      if (!mapping) {
        return res.status(404).json({ message: 'Lecturer-course mapping not found.' });
      }

      // Extract lecturer_id and course_id from the mapping
      const lecturerId = mapping.lecturer_id;
      const courseId = mapping.course_id;

      // 2. Fetch the Lecturer details
      const lecturer = await Lecturer.findByPk(lecturerId, {
          attributes: ['id', 'username', 'email', 'phone', 'bio', 'profile_url'] // Select specific attributes
      });

      // 3. Fetch the Sub_Course details
      const subCourse = await Sub_Course.findByPk(courseId, {
          attributes: ['id', 'title', 'thumbnail', 'overview', 'cost', 'duration', 'category', 'status', 'skills', 'what_you_will_learn'] // Select specific attributes
      });

      // 4. Combine all the information into a single response object
      // You can decide how to structure this. Here's one way:
      const responseData = {
        ...mapping.toJSON(), // Convert mapping instance to a plain JSON object
        lecturer: lecturer ? lecturer.toJSON() : null, // Add lecturer details, or null if not found
        subCourse: subCourse ? subCourse.toJSON() : null, // Add subCourse details, or null if not found
      };

      res.status(200).json(responseData);

    } catch (error) {
      console.error('Error fetching lecturer-course mapping by ID:', error.message);
      res.status(500).json({ message: 'Server error fetching mapping.', error: error.message });
    }
  },

  /**
   * @route GET /api/lecturermaps/course/:courseId
   * @description Get all lecturer-course mappings for a specific course.
   * @access Private
   */
  getLecturerMapsByCourse: async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Fetch all lecturer_map entries for the given courseId
    const mappings = await Lecturers_Map.findAll({
      where: { course_id: courseId },
      order: [['lecturer_id', 'ASC']] // Still good to order them
    });

    // If no mappings are found, return an empty array of lecturerMaps
    if (mappings.length === 0) {
      return res.status(200).json({ message: `No lecturers mapped to course ID: ${courseId}.`, lecturerMaps: [] });
    }

    // 2. Extract unique lecturer IDs from the fetched mappings
    const lecturerIds = mappings.map(map => map.lecturer_id);
    const uniqueLecturerIds = [...new Set(lecturerIds)]; // Get unique IDs

    // 3. Fetch the full details of all these lecturers
    const lecturersDetails = await Lecturer.findAll({
      where: {
        id: uniqueLecturerIds
      },
      attributes: ['id', 'username', 'email', 'profile_url'] // Only fetch necessary attributes
    });

    // Convert lecturersDetails to a map for easy lookup
    const lecturerMap = new Map(lecturersDetails.map(lecturer => [lecturer.id, lecturer]));

    // 4. Combine mappings with lecturer details
    const lecturerMapsWithDetails = mappings.map(mapEntry => {
      const lecturer = lecturerMap.get(mapEntry.lecturer_id);
      return {
        ...mapEntry.toJSON(), // Convert Sequelize instance to plain JSON object
        lecturer_details: lecturer ? lecturer.toJSON() : null // Attach lecturer details
      };
    });

    res.status(200).json({ message: 'Lecturer mappings fetched successfully!', lecturerMaps: lecturerMapsWithDetails });
  } catch (error) {
    console.error('Error fetching lecturer-course mappings by course ID:', error.message);
    res.status(500).json({ message: 'Server error fetching mappings by course.', error: error.message });
  }
},

  /**
   * @route GET /api/lecturermaps/lecturer/:lecturerId
   * @description Get all lecturer-course mappings for a specific lecturer.
   * @access Private
   */
  getLecturerMapsByLecturer: async (req, res) => {
    try {
      const { lecturerId } = req.params;
      const mappings = await Lecturers_Map.findAll({
        where: { lecturer_id: lecturerId },
        order: [['course_id', 'ASC']]
      });

      if (mappings.length === 0) {
        return res.status(404).json({ message: `No mappings found for lecturer ID: ${lecturerId}.` });
      }

      res.status(200).json(mappings);
    } catch (error) {
      console.error('Error fetching lecturer-course mappings by lecturer ID:', error.message);
      res.status(500).json({ message: 'Server error fetching mappings by lecturer.', error: error.message });
    }
  },

  /**
   * @route POST /api/lecturermaps
   * @description Add a new lecturer-course mapping.
   * @access Private (Admin only)
   */
  addLecturerMap: async (req, res) => {
    try {
      const { course_id, lecturer_id } = req.body;

      // --- Input Validation ---
      if (!course_id || lecturer_id === undefined || lecturer_id === null) {
        return res.status(400).json({ message: 'Both course_id and lecturer_id are required.' });
      }
      if (typeof course_id !== 'string') {
        return res.status(400).json({ message: 'course_id must be a string.' });
      }
      if (!Number.isInteger(lecturer_id)) {
        return res.status(400).json({ message: 'lecturer_id must be an integer.' });
      }

      // Optional: Check if a mapping already exists to prevent duplicates
      const existingMapping = await Lecturers_Map.findOne({
        where: { course_id, lecturer_id }
      });
      if (existingMapping) {
        return res.status(409).json({ message: 'This lecturer-course mapping already exists.' });
      }

      const newMapping = await Lecturers_Map.create({
        course_id,
        lecturer_id
      });

      res.status(201).json({
        message: 'Lecturer-course mapping added successfully!',
        mapping: newMapping
      });

    } catch (error) {
      console.error('Error adding lecturer-course mapping:', error.message);
      res.status(500).json({ message: 'Server error while adding mapping.', error: error.message });
    }
  },

  /**
   * @route PUT /api/lecturermaps/:id
   * @description Update an existing lecturer-course mapping.
   * @access Private (Admin only)
   */
  updateLecturerMap: async (req, res) => {
    try {
      const { id } = req.params;
      const { course_id, lecturer_id } = req.body;

      // Find the mapping first
      const mapping = await Lecturers_Map.findByPk(id);
      if (!mapping) {
        return res.status(404).json({ message: 'Lecturer-course mapping not found.' });
      }

      // --- Input Validation for updates ---
      if (course_id && typeof course_id !== 'string') {
        return res.status(400).json({ message: 'course_id must be a string if provided.' });
      }
      if (lecturer_id !== undefined && lecturer_id !== null && !Number.isInteger(lecturer_id)) {
        return res.status(400).json({ message: 'lecturer_id must be an integer if provided.' });
      }

      // Update fields
      mapping.course_id = course_id || mapping.course_id;
      mapping.lecturer_id = lecturer_id || mapping.lecturer_id;

      await mapping.save();

      res.status(200).json({
        message: 'Lecturer-course mapping updated successfully!',
        mapping: mapping
      });

    } catch (error) {
      console.error('Error updating lecturer-course mapping:', error.message);
      res.status(500).json({ message: 'Server error while updating mapping.', error: error.message });
    }
  },

  /**
   * @route DELETE /api/lecturermaps/:id
   * @description Delete a lecturer-course mapping.
   * @access Private (Admin only)
   */
  deleteLecturerMap: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedRowCount = await Lecturers_Map.destroy({
        where: { id: id }
      });

      if (deletedRowCount === 0) {
        return res.status(404).json({ message: 'Lecturer-course mapping not found.' });
      }

      res.status(200).json({ message: 'Lecturer-course mapping deleted successfully!' });

    } catch (error) {
      console.error('Error deleting lecturer-course mapping:', error.message);
      res.status(500).json({ message: 'Server error while deleting mapping.', error: error.message });
    }
  },
  /**
 * Fetches all lecturer-course mappings for a specific course,
 * including the associated lecturer's details, formatted for frontend display.
 * This function is intended for UI components that need lecturer details directly.
 *
 * @param {string} courseId - The ID of the course (or sub-course) to fetch lecturers for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of mapping objects,
 *                                    each containing `id` (the map entry ID), `course_id`,
 *                                    `lecturer_id`, and `lecturer_details` (the full lecturer object).
 */
getLecturersByCourseId: async (courseId) => {
  try {
    // This endpoint on the backend should be configured to eager load the Lecturer details
    // within each mapping record (e.g., using Sequelize's `include` option in the controller).
    const response = await axiosPrivate.get(`/lecturermaps/course/${courseId}`);

    // Assuming the backend response structure for each mapping includes a 'Lecturer' object
    // (common when using Sequelize associations with default naming).
    // We map it to 'lecturer_details' for consistency with frontend state expectations.
    const formattedLecturers = response.data.map(mapEntry => ({
      id: mapEntry.id, // The ID of the lecturer_map entry (primary key of the join table)
      course_id: mapEntry.course_id,
      lecturer_id: mapEntry.lecturer_id,
      lecturer_details: mapEntry.Lecturer, // This should be the eager-loaded Lecturer object from the backend
      // You can include other mapEntry properties from the response if needed, e.g., createdAt, updatedAt
    }));

    return formattedLecturers;
  } catch (error) {
    console.error(`Error fetching lecturers for course ${courseId}:`, error);
    throw error; // Re-throw the error for the calling component to handle
  }
}
};

module.exports = lecturerMapController;
