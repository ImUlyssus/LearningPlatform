// routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authorizeRoles } = require('../middleware/authorizeRoles');
const authMiddleware = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
// @route   GET /api/promotions
// @desc    Get all promotions (separated into running and scheduled by controller)
// @access  Private (accessible by admins/managers)
router.get('/', promotionController.getAllPromotions);

// @route   POST /api/promotions
// @desc    Add a new promotion
// @access  Private (Admin only)
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), promotionController.addPromotion);

// @route   PUT /api/promotions/:id
// @desc    Update an existing promotion
// @access  Private (Admin only)
router.put('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), promotionController.updatePromotion);

// @route   DELETE /api/promotions/:id
// @desc    Delete a promotion
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, authorizeRoles([ADMIN_ROLE, MANAGER_ROLE]), promotionController.deletePromotion);

module.exports = router;
