// src/services/subCourseService.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Fetches all sub-courses.
 */
export const getAllSubCourses = () => {
  return axios.get('/sub-courses');
};

/**
 * Fetches a single sub-course by its ID.
 * @param {string} subCourseId - The ID of the sub-course to fetch.
 */
export const getSubCourseById = (subCourseId) => {
  return axios.get(`/sub-courses/${subCourseId}`);
};

/**
 * Creates a new sub-course.
 * @param {object} subCourseData - The data for the new sub-course.
 */
export const createSubCourse = (subCourseData) => {
  return axiosPrivate.post('/sub-courses', subCourseData);
};

/**
 * Updates an existing sub-course.
 * @param {string} subCourseId - The ID of the sub-course to update.
 * @param {object} subCourseData - The updated data for the sub-course.
 */
export const updateSubCourse = (subCourseId, subCourseData) => {
  return axiosPrivate.put(`/sub-courses/${subCourseId}`, subCourseData);
};

/**
 * "Deletes" a sub-course by setting its 'is_deleted' status to true.
 * @param {string} subCourseId - The ID of the sub-course to soft delete.
 */
export const deleteSubCourse = (subCourseId) => {
  return axiosPrivate.put(`/sub-courses/${subCourseId}/soft-delete`);
};

/**
 * Recovers a soft-deleted sub-course by setting its 'is_deleted' status to false.
 * @param {string} subCourseId - The ID of the sub-course to recover.
 */
export const recoverSubCourse = (subCourseId) => {
  return axiosPrivate.put(`/sub-courses/${subCourseId}/recover`);
};

/**
 * Hard deletes a sub-course and all its associated modules, lectures, and quizzes.
 * @param {string} subCourseId - The ID of the sub-course to hard delete.
 */
export const hardDeleteSubCourse = (subCourseId) => {
  return axiosPrivate.delete(`/sub-courses/${subCourseId}/hard-delete`);
};

// NEW: Fetches sub-courses whose IDs start with the given mainCourseId prefix.
export const getSubCoursesByMainCourseId = (mainCourseId) => {
  return axios.get(`/sub-courses/by-main-course/${mainCourseId}`);
};