// controllers/CourseController.js
const { Course, Sub_Course, Module, Lectures, Quizzes, sequelize, Lecturer, Lecturers_Map, Enrolled_Courses, Promotion } = require('../models'); // Make sure all relevant models and sequelize are imported
const { Op } = require('sequelize');
const { calculateAndSaveCourseDuration } = require('../utils/durationCalculator');

const CourseController = {
  /**
   * @route GET /api/courses
   * @description Get all active (non-deleted) courses
   * @access Private (Admin, Manager, Lecturer)
   */
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.findAll({
        order: [['createdAt', 'DESC']] // Order by creation date, newest first
      });
      res.status(200).json({ courses });
    } catch (error) {
      console.error('Error fetching courses:', error.message);
      res.status(500).json({ message: 'Server error fetching courses.', error: error.message });
    }
  },

  /**
   * @route GET /api/courses/:id
   * @description Get a single course by ID
   * @access Private (Admin, Manager, Lecturer)
   */
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findOne({
        where: {
          id: id,
          is_deleted: false // Ensure the course is not soft-deleted
        }
      });

      if (!course) {
        return res.status(404).json({ message: 'Course not found or has been deleted.' });
      }

      res.status(200).json({ course });
    } catch (error) {
      console.error('Error fetching course by ID:', error.message);
      res.status(500).json({ message: 'Server error fetching course.', error: error.message });
    }
  },

  /**
   * @route POST /api/courses
   * @description Create a new course
   * @access Private (Admin, Lecturer)
   */
  createCourse: async (req, res) => {
    try {
      // ADD 'link' to destructuring
      const { id, title, skills, overview, what_you_will_learn, category, cost } = req.body;

      // Basic validation (add more comprehensive validation as needed)
      if (!id || !title || !skills || !overview || !what_you_will_learn || !cost) {
        return res.status(400).json({ message: 'Missing required course fields.' });
      }

      // Check if a course with the given ID already exists
      const existingCourse = await Course.findByPk(id);
      if (existingCourse) {
        return res.status(409).json({ message: 'Course with this ID already exists.' });
      }

      const newCourse = await Course.create({
        id,
        title,
        skills,
        overview,
        what_you_will_learn,
        category,
        duration: 0,
        cost,
        status: 'draft', // Default status as per model
        is_deleted: false, // Default as per model
      });

      res.status(201).json({ message: 'Course created successfully!', course: newCourse });
    } catch (error) {
      console.error('Error creating course:', error.message);
      res.status(500).json({ message: 'Server error creating course.', error: error.message });
    }
  },

  /**
   * @route PUT /api/courses/:id
   * @description Update an existing course
   * @access Private (Admin, Lecturer)
   */
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, skills, overview, what_you_will_learn, status, category, duration, cost, is_deleted } = req.body;

      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found.' });
      }

      // Store the old status to check if it's changing to published
      const oldStatus = course.status;

      // Handle status change to 'published' for deleted courses first
      if (course.is_deleted) {
        if (status === 'published') {
          return res.status(400).json({ message: 'Cannot publish a deleted course. Please recover it first.' });
        } else {
          return res.status(400).json({ message: 'Cannot update a soft-deleted course. Recover it first.' });
        }
      }

      // Update fields based on provided data from req.body
      course.title = title !== undefined ? title : course.title;
      course.skills = skills !== undefined ? skills : course.skills;
      course.overview = overview !== undefined ? overview : course.overview;
      course.what_you_will_learn = what_you_will_learn !== undefined ? what_you_will_learn : course.what_you_will_learn;
      course.status = status !== undefined ? status : course.status;
      course.category = category !== undefined ? category : course.category;
      course.cost = cost !== undefined ? cost : course.cost;

      // If duration is provided and status is NOT changing to published, allow direct update
      if (status === undefined || status !== 'published') {
        course.duration = duration !== undefined ? duration : course.duration;
      }

      await course.save(); // Save the course's own fields first

      // Trigger duration recalculation if status is changing TO 'published'
      if (course.status === 'published' && oldStatus !== 'published') {
        await calculateAndSaveCourseDuration(id); // This will update the course's duration (and all its children)
      }

      // Fetch the updated course to return the latest data (including recalculated duration)
      const updatedCourse = await Course.findByPk(id);

      res.status(200).json({ message: 'Course updated successfully!', course: updatedCourse });
    } catch (error) {
      console.error('Error updating course:', error.message);
      res.status(500).json({ message: 'Server error updating course.', error: error.message });
    }
  },

  /**
   * @route PUT /api/courses/:id/soft-delete
   * @description Soft delete a course (sets is_deleted to true and status to 'deleted')
   * @access Private (Admin, Manager, Lecturer)
   */
  softDeleteCourse: async (req, res) => {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found.' });
      }

      // Prevent re-deleting an already deleted course (optional)
      if (course.is_deleted) {
        return res.status(409).json({ message: 'Course is already soft-deleted.' });
      }

      course.is_deleted = true;
      course.status = 'deleted'; // Update status to 'deleted'
      await course.save();

      res.status(200).json({ message: 'Course soft-deleted successfully!', course });
    } catch (error) {
      console.error('Error soft deleting course:', error.message);
      res.status(500).json({ message: 'Server error soft deleting course.', error: error.message });
    }
  },

  hardDeleteCourse: async (req, res) => {
    const { id: courseId } = req.params; // Rename id to courseId for clarity

    // Start a transaction to ensure atomicity
    const t = await sequelize.transaction();

    try {
      const course = await Course.findByPk(courseId, { transaction: t });

      if (!course) {
        await t.rollback();
        return res.status(404).json({ message: 'Course not found.' });
      }

      // Crucial: Only allow hard delete if status is 'draft'
      if (course.status !== 'draft') {
        await t.rollback();
        return res.status(403).json({ message: 'Cannot delete a published course.' });
      }

      // --- Perform cascading deletes using ID pattern matching ---
      // Assuming IDs are structured like:
      // Course ID: "C-001"
      // SubCourse ID: "C-001-SC-01" (starts with courseId + "-")
      // Module ID: "C-001-SC-01-MOD-01" (starts with courseId + "-")
      // Lecture ID: "C-001-SC-01-MOD-01-LEC-01" (starts with courseId + "-")
      // Quiz lecture_id: same as Lecture ID

      // 1. Delete associated quiz entries (from Quizzes table)
      // Any quiz lecture_id belonging to this course will start with courseId + "-"
      await Quizzes.destroy({
        where: {
          lecture_id: {
            [Op.like]: `${courseId}-%`
          }
        },
        transaction: t
      });
      console.log(`Deleted quizzes for course ${courseId}`);

      // 2. Delete all lectures belonging to this course
      // Any lecture ID belonging to this course will start with courseId + "-"
      await Lectures.destroy({
        where: {
          id: {
            [Op.like]: `${courseId}-%`
          }
        },
        transaction: t
      });
      console.log(`Deleted lectures for course ${courseId}`);

      // 3. Delete all modules belonging to this course
      // Any module ID belonging to this course will start with courseId + "-"
      await Module.destroy({
        where: {
          id: {
            [Op.like]: `${courseId}-%`
          }
        },
        transaction: t
      });
      console.log(`Deleted modules for course ${courseId}`);

      // 4. Delete all sub-courses belonging to this course
      // Any sub-course ID belonging to this course will start with courseId + "-"
      await Sub_Course.destroy({
        where: {
          id: {
            [Op.like]: `${courseId}-%`
          }
        },
        transaction: t
      });
      console.log(`Deleted sub-courses for course ${courseId}`);

      // 5. Finally, hard delete the Course itself
      await course.destroy({ transaction: t });
      console.log(`Deleted course ${courseId}`);

      // If all operations succeed, commit the transaction
      await t.commit();
      res.status(200).json({ message: 'Course and all associated data deleted successfully!' });

    } catch (error) {
      // If any operation fails, rollback the transaction
      await t.rollback();
      console.error('Error deleting course and associated data:', error.message);
      res.status(500).json({ message: 'Server error deleting course and associated data.', error: error.message });
    }
  },

  /**
   * @route PUT /api/courses/:id/recover
   * @description Recover a soft-deleted course (sets is_deleted to false and status back to 'draft' or 'published')
   * @access Private (Admin, Manager)
   */
  recoverCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ message: 'Course not found.' });
      }

      // Check if the course is actually soft-deleted before attempting recovery
      if (!course.is_deleted) {
        return res.status(409).json({ message: 'Course is not currently soft-deleted.' });
      }

      course.is_deleted = false;
      // You might want to set the status back to 'draft' or its previous status
      // For simplicity, setting it to 'draft'. Adjust as per your business logic.
      course.status = 'draft';
      await course.save();

      res.status(200).json({ message: 'Course recovered successfully!', course });
    } catch (error) {
      console.error('Error recovering course:', error.message);
      res.status(500).json({ message: 'Server error recovering course.', error: error.message });
    }
  },
  /**
   * @route GET /api/courses/nested
   * @description Get all courses with their nested sub-courses, modules, and lectures,
   *              and also include independent sub-courses.
   * @access Public (or Private, depending on your needs)
   */
  getNestedCourses: async (req, res) => {
    try {
      // 1. Fetch all records from each table
      const courses = (await Course.findAll()).map(c => ({ ...c.toJSON(), subCourses: [] }));
      const subCourses = (await Sub_Course.findAll()).map(sc => ({ ...sc.toJSON(), modules: [] }));
      const modules = (await Module.findAll()).map(m => ({ ...m.toJSON(), lectures: [] }));
      const lectures = (await Lectures.findAll()).map(l => l.toJSON());

      // Fetch all data from Lecturer and Lecturers_Map tables
      const lecturers = (await Lecturer.findAll()).map(l => l.toJSON());
      const lecturersMap = (await Lecturers_Map.findAll()).map(lm => lm.toJSON());

      // Fetch all enrolled courses for frequency calculation
      const enrolledCourses = await Enrolled_Courses.findAll();

      // --- NEW: Fetch active promotions ---
      const currentDateTime = new Date(); // Get current date and time

      const activePromotions = await Promotion.findAll({
        where: {
          start_date: {
            [Op.lte]: currentDateTime // start_date <= current_datetime
          },
          end_date: {
            [Op.gte]: currentDateTime // end_date >= current_datetime
          }
        },
        // Optionally, order them if needed, e.g., by start_date
        order: [['start_date', 'ASC']]
      });
      // --- END NEW ---


      // 2. Build the nested structure in memory (lectures into modules)
      for (const lecture of lectures) {
        // Assuming lecture IDs are formatted like "MODULE_ID-LECTURE_SUFFIX"
        const moduleId = lecture.id.substring(0, lecture.id.lastIndexOf('-'));
        const module = modules.find(m => m.id === moduleId);
        if (module) {
          module.lectures.push(lecture);
        }
      }

      // 3. Nest modules into subCourses
      for (const module of modules) {
        // Assuming module IDs are formatted like "SUB_COURSE_ID-MODULE_SUFFIX"
        const subCourseId = module.id.substring(0, module.id.lastIndexOf('-'));
        const subCourse = subCourses.find(sc => sc.id === subCourseId);
        if (subCourse) {
          subCourse.modules.push(module);
        }
      }

      // 4. Nest subCourses into main courses and identify independent ones
      const nestedSubCourseIds = new Set(); // To keep track of sub-courses that are nested
      const mainCoursesResult = []; // To store main courses with their nested sub-courses

      for (const course of courses) {
        // Create a temporary array for sub-courses belonging to this main course
        const currentCourseSubCourses = [];
        for (const subCourse of subCourses) {
          const parts = subCourse.id.split('-');
          const potentialParentCourseId = parts.length > 1 ? parts.slice(0, parts.length - 1).join('-') : null;

          if (potentialParentCourseId === course.id) {
            currentCourseSubCourses.push(subCourse);
            nestedSubCourseIds.add(subCourse.id);
          }
        }
        // Attach the found sub-courses to the main course
        course.subCourses = currentCourseSubCourses;
        mainCoursesResult.push(course);
      }

      // 5. Filter out the independent sub-courses
      const independentSubCoursesResult = subCourses.filter(sc => !nestedSubCourseIds.has(sc.id));

      // NEW LOGIC: Calculate Top 3 Sub-Courses
      const subCourseFrequencies = new Map();
      const subCourseIdMap = new Map(subCourses.map(sc => [sc.id, sc])); // For efficient lookup of sub-course objects

      for (const enrollment of enrolledCourses) {
        const courseId = enrollment.course_id;
        // Check if it's a sub-course ID (three hyphens) and exists in our subCourses list
        const hyphenCount = (courseId.match(/-/g) || []).length;
        if (hyphenCount === 3 && subCourseIdMap.has(courseId)) {
          subCourseFrequencies.set(courseId, (subCourseFrequencies.get(courseId) || 0) + 1);
        }
      }

      // Convert map to array, sort by frequency, and get top 3 IDs
      const top3SubCourseIds = Array.from(subCourseFrequencies.entries())
        .sort((a, b) => b[1] - a[1]) // Sort descending by frequency
        .slice(0, 3) // Get top 3
        .map(entry => entry[0]); // Extract just the course_id

      // Get the actual Sub_Course objects for the top 3 IDs
      const top3SubCourses = top3SubCourseIds
        .map(id => subCourseIdMap.get(id))
        .filter(Boolean); // Filter out any null/undefined in case a course wasn't found (shouldn't happen if map is accurate)


      // 6. Send the structured response
      res.status(200).json({
        mainCourses: mainCoursesResult,
        independentSubCourses: independentSubCoursesResult,
        lecturers: lecturers,
        lecturersMap: lecturersMap,
        topThreeSubCourses: top3SubCourses, // Added top 3 sub-courses
        activePromotions: activePromotions // NEW: Added active promotions
      });
    } catch (error) {
      console.error('Error fetching nested courses:', error.message);
      res.status(500).json({ message: 'Server error fetching nested courses.', error: error.message });
    }
  },
};



module.exports = CourseController;
