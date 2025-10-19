// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController'); // Correct casing for Controller
const authMiddleware = require('../middleware/authMiddleware'); // Assuming this middleware exists
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming this middleware exists
const { ROLES } = require('../utils/constants');
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
// @route   POST /api/quizzes
// @desc    Create a new quiz for a lecture
// @access  Private (Admin only)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), quizController.createQuiz);

// @route   GET /api/quizzes/:lectureId
// @desc    Get a quiz by lecture ID
// @access  Public (or Private, depending on your application's logic)
// If you want to restrict viewing to authenticated users, add: authMiddleware
router.get('/:lectureId', authMiddleware, quizController.getQuizByLectureId);

// @route   PUT /api/quizzes/:lectureId
// @desc    Update an existing quiz by lecture ID
// @access  Private (Admin only)
router.put('/:lectureId', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), quizController.updateQuiz);

// @route   DELETE /api/quizzes/:lectureId
// @desc    Delete a quiz by lecture ID
// @access  Private (Admin only)
router.delete('/:lectureId', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), quizController.deleteQuiz);

module.exports = router;
