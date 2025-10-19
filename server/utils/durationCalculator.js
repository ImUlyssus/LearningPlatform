// src/utils/durationCalculator.js
const { Module, Lectures, Sub_Course, Course } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculates and updates the duration of a specific Module.
 * Sums the durations of all its associated Lectures.
 * @param {string} moduleId The ID of the module to calculate and update.
 * @returns {Promise<number>} The new calculated duration of the module.
 */
async function calculateAndSaveModuleDuration(moduleId) {
  const lectures = await Lectures.findAll({
    where: {
      id: {
        [Op.like]: `${moduleId}%`
      }
    },
    attributes: ['duration'] // Only fetch the duration attribute
  });

  const totalLectureDuration = lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);

  await Module.update(
    { duration: totalLectureDuration },
    { where: { id: moduleId } }
  );

  return totalLectureDuration;
}

/**
 * Calculates and updates the duration of a specific Sub_Course.
 * It first recalculates and sums the durations of all its child Modules.
 * @param {string} subCourseId The ID of the sub-course to calculate and update.
 * @returns {Promise<number>} The new calculated duration of the sub-course.
 */
async function calculateAndSaveSubCourseDuration(subCourseId) {
  // Find all modules whose IDs start with the subCourseId
  const modules = await Module.findAll({
    where: {
      id: {
        [Op.like]: `${subCourseId}%`
      }
    },
    attributes: ['id'] // We only need the ID to trigger module duration recalculation
  });

  let totalModuleDuration = 0;
  // For each module, recalculate its duration from its lectures and add to sum
  for (const module of modules) {
    const moduleDuration = await calculateAndSaveModuleDuration(module.id); // Recalculate module duration
    totalModuleDuration += moduleDuration;
  }

  // Update the sub-course's duration in the database
  await Sub_Course.update(
    { duration: totalModuleDuration },
    { where: { id: subCourseId } }
  );

  return totalModuleDuration;
}

/**
 * Calculates and updates the duration of a specific Course.
 * It first recalculates and sums the durations of all its child Sub_Courses.
 * @param {string} courseId The ID of the course to calculate and update.
 * @returns {Promise<number>} The new calculated duration of the course.
 */
async function calculateAndSaveCourseDuration(courseId) {
  // Find all sub-courses whose IDs start with the courseId
  const subCourses = await Sub_Course.findAll({
    where: {
      id: {
        [Op.like]: `${courseId}%`
      }
    },
    attributes: ['id'] // We only need the ID to trigger sub-course duration recalculation
  });

  let totalSubCourseDuration = 0;
  // For each sub-course, recalculate its duration from its modules/lectures and add to sum
  for (const subCourse of subCourses) {
    // This call will recursively update modules and lectures, and then itself
    const subCourseDuration = await calculateAndSaveSubCourseDuration(subCourse.id); // Recalculate sub-course duration
    totalSubCourseDuration += subCourseDuration;
  }

  // Update the main course's duration in the database
  await Course.update(
    { duration: totalSubCourseDuration },
    { where: { id: courseId } }
  );
  return totalSubCourseDuration;
}

module.exports = {
  calculateAndSaveModuleDuration,
  calculateAndSaveSubCourseDuration,
  calculateAndSaveCourseDuration
};
