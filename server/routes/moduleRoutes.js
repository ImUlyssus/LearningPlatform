// src/routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming you have this middleware
const authMiddleware = require('../middleware/authMiddleware'); // Added authMiddleware import
const { ROLES } = require('../utils/constants');
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
const LECTURER_ROLE = ROLES.LECTURER;
const USER_ROLE = ROLES.NORMAL;

router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), moduleController.createModule);
router.get('/sub-course/:subCourseId', moduleController.getModulesBySubCourse);
router.get('/:id', moduleController.getModuleById);
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), moduleController.updateModule);
router.delete('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), moduleController.deleteModule);

module.exports = router;
