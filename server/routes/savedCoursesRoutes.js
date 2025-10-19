const express = require('express');
const router = express.Router();
const savedCoursesController = require('../controllers/savedCoursesController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have an authMiddleware

// All routes in this file require authentication
router.use(authMiddleware);

// @route   POST /api/saved-courses
// @desc    Save a course for the authenticated user
// @access  Private (User specific)
router.post('/', savedCoursesController.saveCourse);

// @route   DELETE /api/saved-courses/:course_id
// @desc    Unsave a course for the authenticated user
// @access  Private (User specific)
router.delete('/:course_id', savedCoursesController.unsaveCourse);

// @route   GET /api/saved-courses
// @desc    Get all saved courses for the authenticated user
// @access  Private (User specific)
router.get('/', savedCoursesController.getSavedCourses);

module.exports = router;
