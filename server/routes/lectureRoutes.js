// src/routes/lectureRoutes.js
const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { authorizeRoles } = require('../middleware/authorizeRoles'); // Assuming you have this middleware
const authMiddleware = require('../middleware/authMiddleware'); // Added authMiddleware import
const { ROLES } = require('../utils/constants'); 
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;

router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lectureController.createLecture);
router.get('/module/:moduleId', lectureController.getLecturesByModule);
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lectureController.updateLecture);
router.delete('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lectureController.deleteLecture);
router.delete('/by-module/:moduleId', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), lectureController.deleteAllLecturesByModule);

module.exports = router;
