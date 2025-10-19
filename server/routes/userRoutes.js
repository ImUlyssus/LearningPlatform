// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ROLES } = require('../utils/constants');
const { authorizeRoles } = require('../middleware/authorizeRoles');

const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;

router.put('/password', userController.updatePassword);

// @route   GET /api/user/profile
// @desc    Get authenticated user's profile
// @access  Private
router.get('/profile', userController.getProfile);

// @route   PUT /api/user/personal-info
// @desc    Update authenticated user's personal information
// @access  Private
router.put('/personal-info', userController.updatePersonalInfo);

// @route   PUT /api/user/email
// @desc    Update authenticated user's email
// @access  Private
router.put('/email', userController.updateEmail);

// @route   GET /api/user/search?email=<email>
// @desc    Search for a user by email address
// @access  Private (e.g., accessible by managers/admins)
router.get('/search/:email', authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), userController.findUserByEmail);

// @route   PUT /api/user/managers
// @desc    Update user to manager role (6355)
// @access  Private (e.g., accessible by admins only)
router.post('/managers', authorizeRoles([ADMIN_ROLE]), userController.addManagerRole);

// @route   PUT /api/user/lecturers
// @desc    Update user to lecturer role (3840)
// @access  Private (e.g., accessible by admins/managers)
router.post('/lecturers', authorizeRoles([ADMIN_ROLE]), userController.addLecturerRole);

// @route   PUT /api/user/managers/remove
// @desc    Demote user from manager role to normal user
// @access  Private (accessible by admins only)
router.put('/managers/remove', authorizeRoles([ADMIN_ROLE]), userController.removeManagerRole);

// @route   PUT /api/user/lecturers/remove
// @desc    Demote user from lecturer role to normal user
// @access  Private (accessible by admins/managers)
router.put('/lecturers/remove', authorizeRoles([MANAGER_ROLE, ADMIN_ROLE]), userController.removeLecturerRole);

// NEW: @route   GET /api/user/managers
// NEW: @desc    Get all users with manager role
// NEW: @access  Private (accessible by admins only)
router.get('/managers', authorizeRoles([ADMIN_ROLE]), userController.getManagers);

// NEW: @route   GET /api/user/lecturers
// NEW: @desc    Get all users with lecturer role
// NEW: @access  Private (accessible by admins/managers)
router.get('/lecturers', authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), userController.getLecturers);

// Update user details (Admin, Manager only - or potentially user themselves for certain fields)
router.put('/:id', authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), userController.updateUser);

// @route   GET /api/user/me
// @desc    Get authenticated user's comprehensive data (profile, enrolled, saved, certificates)
// @access  Private (requires authentication middleware to provide req.user.id)
router.get('/me', userController.getCurrentUser);

module.exports = router;
