// src/services/enrolledCourses.js
import { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Fetches all enrolled courses. Requires administrative or managerial privileges.
 * @returns {Promise<object>} A promise that resolves to the list of enrolled courses.
 */
export const getAllEnrolledCourses = () => {
  return axiosPrivate.get('/enrolled-courses');
};

/**
 * Fetches a single enrolled course by its ID.
 * @param {number} enrollmentId - The ID of the enrolled course entry.
 * @returns {Promise<object>} A promise that resolves to the enrolled course data.
 */
export const getEnrolledCourseById = (enrollmentId) => {
  return axiosPrivate.get(`/enrolled-courses/${enrollmentId}`);
};

/**
 * Fetches all courses a specific user is enrolled in.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<object>} A promise that resolves to the list of enrolled courses for the user.
 */
export const getEnrolledCoursesByUserId = (userId) => {
  return axiosPrivate.get(`/enrolled-courses/user/${userId}`);
};

/**
 * Fetches all users enrolled in a specific course.
 * @param {number} courseId - The ID of the course.
 * @returns {Promise<object>} A promise that resolves to the list of enrollments for the course.
 */
export const getEnrolledCoursesByCourseId = (courseId) => {
  return axiosPrivate.get(`/enrolled-courses/course/${courseId}`);
};

/**
 * Enrolls a user in a course.
 * @param {object} enrollmentData - The data for the new enrollment (user_id, course_id, enrolled_date, discount_value).
 * @returns {Promise<object>} A promise that resolves to the created enrollment data.
 */
export const enrollUserInCourse = (enrollmentData) => {
  return axiosPrivate.post('/enrolled-courses', enrollmentData);
};

/**
 * Updates an existing enrolled course entry.
 * @param {number} enrollmentId - The ID of the enrolled course entry to update.
 * @param {object} updateData - The updated data for the enrollment (e.g., quizzes_info, discount_value).
 * @returns {Promise<object>} A promise that resolves to the updated enrollment data.
 */
export const updateEnrolledCourse = (enrollmentId, updateData) => {
  return axiosPrivate.put(`/enrolled-courses/${enrollmentId}`, updateData);
};

/**
 * Marks an enrolled course as completed.
 * @param {number} enrollmentId - The ID of the enrolled course entry to mark as completed.
 * @returns {Promise<object>} A promise that resolves to the updated enrollment data.
 */
export const markCourseAsCompleted = (enrollmentId) => {
  return axiosPrivate.put(`/enrolled-courses/${enrollmentId}/complete`, { completed: true });
};

/**
 * Deletes an enrolled course entry (unenrolls a user from a course).
 * @param {number} enrollmentId - The ID of the enrolled course entry to delete.
 * @returns {Promise<object>} A promise that resolves upon successful deletion.
 */
export const deleteEnrolledCourse = (enrollmentId, userId) => {
  // For DELETE requests with a body, axios requires the data in a 'data' property
  return axiosPrivate.delete(`/enrolled-courses/${enrollmentId}`, { data: { userId } });
};

/**
 * Updates a user's quiz progress information for a specific course.
 * @param {object} quizProgressData - Object containing quizId, minScoreToPass, scoreReceived, and courseId.
 * @returns {Promise<object>} A promise that resolves to the updated enrollment data.
 */
export const updateQuizInfo = (quizProgressData) => {
  // This will send a POST request to /api/enrolled-courses/quiz-info
  return axiosPrivate.post('/enrolled-courses/quiz-info', quizProgressData);
};