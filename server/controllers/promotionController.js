// controllers/PromotionController.js
const { Promotion } = require('../models');
const { Op } = require('sequelize');

const promotionController = {
  /**
   * @route GET /api/promotions
   * @description Get all promotions, separated into running and scheduled
   * @access Private (Admin/Manager)
   */
  getAllPromotions: async (req, res) => {
    try {
      const now = new Date();
      const allPromotions = await Promotion.findAll({
        order: [['start_date', 'ASC']] // Order by start date for consistent display
      });

      const runningPromotions = [];
      const scheduledPromotions = [];

      allPromotions.forEach(promo => {
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);

        if (startDate <= now && endDate >= now) {
          runningPromotions.push(promo);
        } else if (startDate > now) {
          scheduledPromotions.push(promo);
        }
        // Promotions that have ended (endDate < now) are implicitly excluded from these lists
      });

      res.status(200).json({ runningPromotions, scheduledPromotions });
    } catch (error) {
      console.error('Error fetching all promotions:', error.message);
      res.status(500).json({ message: 'Server error fetching promotions.', error: error.message });
    }
  },

  /**
   * @route POST /api/promotions
   * @description Add a new promotion
   * @access Private (Admin only)
   */
  addPromotion: async (req, res) => {
    try {
      const { amount, title, startDate, endDate, description, course_id } = req.body; // course_id is now directly from frontend

      // --- Input Validation ---
      if (!amount || !title || !startDate || !endDate || !description || course_id === undefined || course_id === null) {
        return res.status(400).json({ message: 'All required fields (amount, title, startDate, endDate, description, course_id) must be provided.' });
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start or end date format.' });
      }

      if (parsedStartDate >= parsedEndDate) {
          return res.status(400).json({ message: 'End date must be after start date.' });
      }

      // Ensure course_id is a string, even if it was originally an array (JSON stringified)
      if (typeof course_id !== 'string') {
          return res.status(400).json({ message: 'course_id must be a string (e.g., "ALL_COURSES" or JSON string of IDs).' });
      }

      const newPromotion = await Promotion.create({
        promotion_amount: amount,
        title,
        description,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        course_id: course_id, // Directly use the course_id string from frontend
      });

      res.status(201).json({
        message: 'Promotion added successfully!',
        promotion: newPromotion
      });

    } catch (error) {
      console.error('Error adding promotion:', error.message);
      res.status(500).json({ message: 'Server error while adding promotion.', error: error.message });
    }
  },

  /**
   * @route PUT /api/promotions/:id
   * @description Update an existing promotion
   * @access Private (Admin only)
   */
  updatePromotion: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, title, startDate, endDate, description, course_id } = req.body;

      // --- Input Validation ---
      if (!amount || !title || !startDate || !endDate || !description || course_id === undefined || course_id === null) {
        return res.status(400).json({ message: 'All required fields (amount, title, startDate, endDate, description, course_id) must be provided.' });
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: 'Invalid start or end date format.' });
      }

      if (parsedStartDate >= parsedEndDate) {
          return res.status(400).json({ message: 'End date must be after start date.' });
      }

      if (typeof course_id !== 'string') {
          return res.status(400).json({ message: 'course_id must be a string (e.g., "ALL_COURSES" or JSON string of IDs).' });
      }

      const promotion = await Promotion.findByPk(id);

      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found.' });
      }

      promotion.promotion_amount = amount;
      promotion.title = title;
      promotion.description = description;
      promotion.start_date = parsedStartDate;
      promotion.end_date = parsedEndDate;
      promotion.course_id = course_id; // Directly use the course_id string from frontend

      await promotion.save();

      res.status(200).json({
        message: 'Promotion updated successfully!',
        promotion: promotion
      });

    } catch (error) {
      console.error('Error updating promotion:', error.message);
      res.status(500).json({ message: 'Server error while updating promotion.', error: error.message });
    }
  },

  /**
   * @route DELETE /api/promotions/:id
   * @description Delete a promotion by ID
   * @access Private (Admin only)
   */
  deletePromotion: async (req, res) => {
    try {
      const { id } = req.params;

      const promotion = await Promotion.findByPk(id);

      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found.' });
      }

      await promotion.destroy();

      res.status(200).json({ message: 'Promotion deleted successfully!' });
    } catch (error) {
      console.error('Error deleting promotion:', error.message);
      res.status(500).json({ message: 'Server error while deleting promotion.', error: error.message });
    }
  }
};

module.exports = promotionController;
