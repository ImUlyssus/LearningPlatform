// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authorizeRoles } = require('../middleware/authorizeRoles');
const authMiddleware = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

// Roles for authorization (adjust as per your application's needs)
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;

router.get('/nested', courseController.getNestedCourses);

// @route   GET /api/courses
// @desc    Get all courses (typically non-deleted ones)
// @access  Private (e.g., accessible by admins, managers, lecturers)
router.get('/', courseController.getAllCourses);

// @route   GET /api/courses/:id
// @desc    Get a single course by ID
// @access  Private (e.g., accessible by admins, managers, lecturers)
router.get('/:id', courseController.getCourseById);


// @route   PUT /api/courses/:id/soft-delete
// @desc    Soft delete a course (sets is_deleted to true and status to 'deleted')
// @access  Private (e.g., accessible by admins, managers, lecturers)
// Using PUT here to explicitly update a status, rather than a full DELETE which implies permanent removal.
router.delete('/:id/hard-delete', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), courseController.hardDeleteCourse);

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (e.g., accessible by admins, lecturers)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), courseController.createCourse);

// @route   PUT /api/courses/:id
// @desc    Update an existing course
// @access  Private (e.g., accessible by admins, lecturers)
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), courseController.updateCourse);

// @route   PUT /api/courses/:id/soft-delete
// @desc    Soft delete a course (sets is_deleted to true and status to 'deleted')
// @access  Private (e.g., accessible by admins, managers, lecturers)
// Using PUT here to explicitly update a status, rather than a full DELETE which implies permanent removal.
router.put('/:id/soft-delete', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), courseController.softDeleteCourse);

// If you prefer to use a DELETE verb for soft deletion, you would map it like this:
// router.delete('/:id', authorizeRoles([ADMIN_ROLE, LECTURER_ROLE, MANAGER_ROLE]), courseController.softDeleteCourse);

// @route   PUT /api/courses/:id/recover
// @desc    Recover a soft-deleted course (sets is_deleted to false and status to 'draft' or 'published')
// @access  Private (e.g., accessible by admins, managers)
router.put('/:id/recover', authMiddleware, authorizeRoles([ADMIN_ROLE]), courseController.recoverCourse);

module.exports = router;
