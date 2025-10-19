// routes/lecturerRoutes.js
const express = require('express');
const router = express.Router();
const lecturerController = require('../controllers/lecturerController'); // You will create this file
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming you have this middleware
const authMiddleware = require('../middleware/authMiddleware'); // Added authMiddleware import
const { ROLES } = require('../utils/constants');

// Roles for authorization (adjust as per your application's needs)
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;

// @route   GET /api/lecturers
// @desc    Get all active (non-deleted) lecturers
// @access  Private (e.g., accessible by admins, managers)
router.get('/', lecturerController.getAllLecturers); // Authorization usually applied here too

// @route   GET /api/lecturers/:id
// @desc    Get a single lecturer by ID
// @access  Private (e.g., accessible by admins, managers, or the lecturer themselves)
router.get('/:id', lecturerController.getLecturerById); // Authorization usually applied here too

router.get('/search/:email', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerController.searchLecturerByEmail);

// @route   POST /api/lecturers
// @desc    Create a new lecturer
// @access  Private (e.g., accessible by admins)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerController.createLecturer);

// @route   PUT /api/lecturers/:id
// @desc    Update an existing lecturer
// @access  Private (e.g., accessible by admins, managers, or the lecturer themselves)
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerController.updateLecturer);

// @route   PUT /api/lecturers/:id/soft-delete
// @desc    Soft delete a lecturer (sets is_deleted to true)
// @access  Private (e.g., accessible by admins)
router.put('/:id/soft-delete', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerController.softDeleteLecturer);

// NEW ROUTE
// @route   PUT /api/lecturers/:id/recover
// @desc    Recover a soft-deleted lecturer (sets is_deleted to false)
// @access  Private (e.g., accessible by admins)
router.put('/:id/recover', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerController.recoverLecturer);


module.exports = router;
