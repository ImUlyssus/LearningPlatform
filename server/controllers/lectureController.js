// src/controllers/lectureController.js
const { Lectures, Quizzes } = require('../models'); // Adjust path to your models
const { Op } = require('sequelize');

const lectureController = {
  createLecture: async (req, res) => {
    try {
      const { id, title, type, slides, duration, moduleId, qa_data, min_score_to_pass } = req.body;

      // Basic validation for common fields
      if (!id || !title || !type || duration === undefined || !moduleId) {
        return res.status(400).json({ message: 'Missing required lecture fields: id, title, type, duration, moduleId.' });
      }

      // Specific validation for quiz lectures
      if (type === 'quiz' && (!qa_data || !Array.isArray(qa_data) || qa_data.length === 0 || min_score_to_pass === undefined)) {
        return res.status(400).json({ message: 'Missing required fields for quiz lecture: qa_data, min_score_to_pass.' });
      }

      const existingLecture = await Lectures.findByPk(id);
      if (existingLecture) {
        return res.status(409).json({ message: 'Lecture with this ID already exists.' });
      }

      // Create the Lecture entry
      const newLecture = await Lectures.create({
        id,
        title,
        type,
        link: null,
        slides: type !== 'quiz' ? slides : null,
        duration,
        moduleId,
      });

      // If it's a quiz, also create an entry in the Quizzes table
      if (type === 'quiz') {
        await Quizzes.create({
          lecture_id: id, // Using lecture_id as primary key in Quizzes
          qa_data: qa_data,
          min_score_to_pass: min_score_to_pass,
          // 'type' column for quiz is now handled within qa_data objects,
          // but if your Quizzes model still has a top-level 'type', you might map it here
          // e.g., type: 'multiple_choice' or a general 'quiz' if it's enum
        });
      }

      res.status(201).json({ message: 'Lecture created successfully!', lecture: newLecture });
    } catch (error) {
      console.error('Error creating lecture:', error.message);
      res.status(500).json({ message: 'Server error creating lecture.', error: error.message });
    }
  },

  updateLecture: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, type, slides, duration, qa_data, min_score_to_pass } = req.body;

      const lecture = await Lectures.findByPk(id);

      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found.' });
      }

      const oldType = lecture.type; // Store the current type before update

      // Update Lecture fields
      lecture.title = title !== undefined ? title : lecture.title;
      lecture.type = type !== undefined ? type : lecture.type;
      lecture.duration = duration !== undefined ? duration : lecture.duration;

      // Handle link and slides based on new type
      if (type !== 'quiz') {
        lecture.link = link !== undefined ? link : lecture.link;
        lecture.slides = slides !== undefined ? slides : lecture.slides;
      } else {
        lecture.link = null; // Clear link/slides if changing to quiz
        lecture.slides = null;
      }

      await lecture.save(); // Save the updated lecture first

      // --- Manual CRUD operations for Quizzes table ---

      if (oldType === 'quiz' && type === 'quiz') {
        // Case 1: Was quiz, still quiz - UPDATE Quizzes entry
        if (!qa_data || !Array.isArray(qa_data) || qa_data.length === 0 || min_score_to_pass === undefined) {
          return res.status(400).json({ message: 'Missing required fields for quiz lecture update: qa_data, min_score_to_pass.' });
        }
        await Quizzes.update(
          { qa_data: qa_data, min_score_to_pass: min_score_to_pass },
          { where: { lecture_id: id } }
        );
      } else if (oldType === 'quiz' && type !== 'quiz') {
        // Case 2: Was quiz, now not quiz - DELETE Quizzes entry
        await Quizzes.destroy({ where: { lecture_id: id } });
      } else if (oldType !== 'quiz' && type === 'quiz') {
        // Case 3: Was not quiz, now quiz - CREATE Quizzes entry
        if (!qa_data || !Array.isArray(qa_data) || qa_data.length === 0 || min_score_to_pass === undefined) {
          return res.status(400).json({ message: 'Missing required fields for quiz lecture creation: qa_data, min_score_to_pass.' });
        }
        await Quizzes.create({
          lecture_id: id,
          qa_data: qa_data,
          min_score_to_pass: min_score_to_pass,
        });
      }
      // Case 4: Was not quiz, still not quiz - No action needed for Quizzes table

      res.status(200).json({ message: 'Lecture updated successfully!', lecture });
    } catch (error) {
      console.error('Error updating lecture:', error.message);
      res.status(500).json({ message: 'Server error updating lecture.', error: error.message });
    }
  },

  /**
   * @route GET /api/lectures/module/:moduleId
   * @description Get all lectures for a specific module based on ID prefix,
   *              and enrich quiz lectures with their QA data.
   * @access Private
   */
  getLecturesByModule: async (req, res) => {
    try {
      const { moduleId } = req.params;

      const lectures = await Lectures.findAll({
        where: {
          id: {
            [Op.startsWith]: `${moduleId}-`
          }
        },
        order: [['createdAt', 'ASC']] // Or order by ID for consistent numbering
      });

      if (!lectures || lectures.length === 0) {
        return res.status(200).json({ message: `No lectures found for module ID: ${moduleId}.`, lectures: [] });
      }

      // Enrich quiz lectures with data from the Quizzes table
      const enrichedLectures = await Promise.all(lectures.map(async (lecture) => {
        if (lecture.type === 'quiz') {
          const quizData = await Quizzes.findByPk(lecture.id); // Use lecture.id as lecture_id in Quizzes table
          if (quizData) {
            return {
              ...lecture.toJSON(), // Convert Sequelize instance to plain JSON object
              qa_data: quizData.qa_data,
              min_score_to_pass: quizData.min_score_to_pass,
            };
          }
        }
        return lecture.toJSON(); // Return non-quiz lectures as plain JSON
      }));

      res.status(200).json({ message: 'Lectures fetched successfully!', lectures: enrichedLectures });
    } catch (error) {
      console.error('Error fetching lectures by module ID:', error.message);
      res.status(500).json({ message: 'Server error fetching lectures.', error: error.message });
    }
  },


  /**
   * @route DELETE /api/lectures/:id
   * @description Delete a lecture and its associated quiz data if applicable.
   * @access Private (Admin, Manager)
   */
  deleteLecture: async (req, res) => {
    try {
      const { id } = req.params;

      const lecture = await Lectures.findByPk(id);

      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found.' });
      }

      // If the lecture is a quiz, delete its entry from the Quizzes table first
      if (lecture.type === 'quiz') {
        await Quizzes.destroy({ where: { lecture_id: id } });
      }

      // Then delete the lecture itself
      await lecture.destroy();

      res.status(200).json({ message: 'Lecture deleted successfully.' });
    } catch (error) {
      console.error('Error deleting lecture:', error.message);
      res.status(500).json({ message: 'Server error deleting lecture.', error: error.message });
    }
  },

  /**
   * @route DELETE /api/lectures/by-module/:moduleId
   * @description Delete all lectures associated with a given module ID,
   *              including their associated quiz data.
   * @access Private (Admin, Manager)
   */
  deleteAllLecturesByModule: async (req, res) => {
    try {
      const { moduleId } = req.params;

      // Find all lecture IDs for this module that are of type 'quiz'
      const quizLecturesToDelete = await Lectures.findAll({
        attributes: ['id'], // Only fetch the ID
        where: {
          type: 'quiz',
          id: {
            [Op.like]: `${moduleId}-%`
          }
        }
      });

      const quizLectureIds = quizLecturesToDelete.map(lecture => lecture.id);

      // If there are quiz lectures, delete their entries from the Quizzes table
      if (quizLectureIds.length > 0) {
        await Quizzes.destroy({
          where: {
            lecture_id: {
              [Op.in]: quizLectureIds // Delete all quizzes whose lecture_id is in the list
            }
          }
        });
      }

      // Finally, delete all lectures for this module from the Lectures table
      const deletedCount = await Lectures.destroy({
        where: {
          id: {
            [Op.like]: `${moduleId}-%`
          }
        }
      });

      if (deletedCount === 0) {
        return res.status(200).json({ message: 'No lectures found or deleted for this module ID.', deletedCount: 0 });
      }

      res.status(200).json({ message: `Successfully deleted ${deletedCount} lectures and associated quiz data for module ${moduleId}.`, deletedCount });
    } catch (error) {
      console.error('Error deleting lectures by module ID:', error.message);
      res.status(500).json({ message: 'Server error deleting lectures by module ID.', error: error.message });
    }
  },
};

module.exports = lectureController;
