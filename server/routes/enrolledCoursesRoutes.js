// routes/enrolledCoursesRoutes.js
const express = require('express');
const router = express.Router();
const enrolledCoursesController = require('../controllers/enrolledCoursesController');
const { authorizeRoles } = require('../middleware/authorizeRoles');
const authMiddleware = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

// Roles for authorization (adjust as per your application's needs)
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
const LECTURER_ROLE = ROLES.LECTURER;
const USER_ROLE = ROLES.NORMAL;

// Get all enrolled courses (Admin, Manager only)
router.get('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), enrolledCoursesController.getAllEnrolledCourses);

// Get a single enrolled course by ID (Admin, Manager, or the user themselves)
router.get('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE, USER_ROLE]), enrolledCoursesController.getEnrolledCourseById);

// Get all courses for a specific user (Admin, Manager, or the user themselves)
router.get('/user/:userId', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE, USER_ROLE]), enrolledCoursesController.getEnrolledCoursesByUserId);

// Get all users enrolled in a specific course (Admin, Manager, Lecturer for their own courses)
router.get('/course/:courseId', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE, LECTURER_ROLE]), enrolledCoursesController.getEnrolledCoursesByCourseId);

// Enroll a user in a course (Admin, Manager, or User for self-enrollment)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE, USER_ROLE]), enrolledCoursesController.createEnrolledCourse);

// Update an enrolled course (Admin, Manager, or the user themselves for their progress/info)
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE, USER_ROLE]), enrolledCoursesController.updateEnrolledCourse);

// Mark a course as completed (Admin, Manager, or the user themselves)
router.put('/:id/complete', authMiddleware, enrolledCoursesController.markCourseAsCompleted);

// Delete an enrolled course (unenroll) (Admin, Manager only)
router.delete('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), enrolledCoursesController.deleteEnrolledCourse);

// @route   POST /api/enrolled-courses/quiz-info
// @desc    Update a user's quiz information for a specific course
// @access  Private (User only - for their own progress)
router.post('/quiz-info', authMiddleware, enrolledCoursesController.updateQuizInfo);

module.exports = router;
