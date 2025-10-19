// routes/subCourseRoutes.js
const express = require('express');
const router = express.Router();
const subCourseController = require('../controllers/subCourseController'); // Adjust path
const { authorizeRoles } = require('../middleware/authorizeRoles');
const authMiddleware = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

// Roles for authorization (adjust as per your application's needs)
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
// Assuming LECTURER_ROLE might also be needed for viewing/managing their own sub-courses

// Public routes (no authentication required)
router.get('/', subCourseController.getAllSubCourses);
router.get('/:id', subCourseController.getSubCourseById);
// NEW: Route to get sub-courses whose IDs start with a given mainCourseId
router.get('/by-main-course/:mainCourseId', subCourseController.getSubCoursesByMainCoursePrefix);
// Protected routes (authentication and authorization required)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), subCourseController.createSubCourse);
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), subCourseController.updateSubCourse);
router.put('/:id/soft-delete', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), subCourseController.softDeleteSubCourse);
router.put('/:id/recover', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), subCourseController.recoverSubCourse);
router.delete('/:id/hard-delete', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), subCourseController.hardDeleteSubCourse);
module.exports = router;
