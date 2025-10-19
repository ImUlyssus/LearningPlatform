// routes/lecturerMapRoutes.js
const express = require('express');
const router = express.Router();
const lecturerMapController = require('../controllers/lecturerMapController');
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming you have this middleware
const authMiddleware = require('../middleware/authMiddleware');     // Assuming you have this middleware
const { ROLES } = require('../utils/constants');

// Define the ADMIN_ROLE from your environment variables
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;

// @route   GET /api/lecturermaps
// @desc    Get all lecturer-course mappings
// @access  Private (accessible by authenticated users, potentially managers/admins)
router.get('/', authMiddleware, lecturerMapController.getAllLecturerMaps);

// @route   GET /api/lecturermaps/:id
// @desc    Get a single lecturer-course mapping by ID
// @access  Private (accessible by authenticated users)
router.get('/:id', lecturerMapController.getLecturerMapById);

// @route   GET /api/lecturermaps/course/:courseId
// @desc    Get all lecturer-course mappings for a specific course
// @access  Private (accessible by authenticated users)
router.get('/course/:courseId', lecturerMapController.getLecturerMapsByCourse);

// @route   GET /api/lecturermaps/lecturer/:lecturerId
// @desc    Get all lecturer-course mappings for a specific lecturer
// @access  Private (accessible by authenticated users)
router.get('/lecturer/:lecturerId', authMiddleware, lecturerMapController.getLecturerMapsByLecturer);

// @route   POST /api/lecturermaps
// @desc    Add a new lecturer-course mapping
// @access  Private (Admin only)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerMapController.addLecturerMap);

// @route   PUT /api/lecturermaps/:id
// @desc    Update an existing lecturer-course mapping
// @access  Private (Admin only)
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerMapController.updateLecturerMap);

// @route   DELETE /api/lecturermaps/:id
// @desc    Delete a lecturer-course mapping
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lecturerMapController.deleteLecturerMap);

module.exports = router;
