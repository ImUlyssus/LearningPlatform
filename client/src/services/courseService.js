// src/services/courseService.js
import axios, { axiosPrivate } from './axios';

/**
 * Fetches all courses.
 * By default, this will likely fetch non-deleted courses.
 * The backend implementation will determine exact filtering.
 */
export const getCourses = () => {
  return axios.get('/courses');
};

/**
 * Fetches all courses with their nested sub-courses, modules, and lectures.
 */
export const getNestedCourses = () => {
  return axios.get('/courses/nested');
};

/**
 * Fetches a single course by its ID.
 * @param {string} courseId - The ID of the course to fetch.
 */
export const getCourseById = (courseId) => {
  return axios.get(`/courses/${courseId}`);
};

/**
 * Creates a new course.
 * @param {object} courseData - The data for the new course.
 */
export const createCourse = (courseData) => {
  return axiosPrivate.post('/courses', courseData);
};

/**
 * Updates an existing course.
 * @param {string} courseId - The ID of the course to update.
 * @param {object} courseData - The updated data for the course.
 */
export const updateCourse = (courseId, courseData) => {
  return axiosPrivate.put(`/courses/${courseId}`, courseData);
};

/**
 * "Deletes" a course by setting its 'is_deleted' status to true.
 * @param {string} courseId - The ID of the course to soft delete.
 */
export const hardDeleteCourse = (courseId) => {
  // We'll use a PUT request to update the 'is_deleted' status on the backend.
  // The backend will handle setting is_deleted to true and status to 'deleted'.
  // console.log('hardDeleteCourse called with courseId:', courseId);
  return axiosPrivate.delete(`/courses/${courseId}/hard-delete`);
  // Alternatively, you could use a DELETE method on the frontend, and the backend DELETE route would handle the soft delete.
  // return axiosPrivate.delete(`/courses/${courseId}`);
};

/**
 * "Deletes" a course by setting its 'is_deleted' status to true.
 * @param {string} courseId - The ID of the course to soft delete.
 */
export const deleteCourse = (courseId) => {
  // We'll use a PUT request to update the 'is_deleted' status on the backend.
  // The backend will handle setting is_deleted to true and status to 'deleted'.
  return axiosPrivate.put(`/courses/${courseId}/soft-delete`);
  // Alternatively, you could use a DELETE method on the frontend, and the backend DELETE route would handle the soft delete.
  // return axiosPrivate.delete(`/courses/${courseId}`);
};

/**
 * Recovers a soft-deleted course by setting its 'is_deleted' status to false.
 * @param {string} courseId - The ID of the course to recover.
 */
export const recoverCourse = (courseId) => {
  // This assumes a PUT endpoint on the backend to change is_deleted back to false.
  return axiosPrivate.put(`/courses/${courseId}/recover`);
};