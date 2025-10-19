import { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Saves a course for the authenticated user.
 * @param {string} courseId - The ID of the course to save.
 * @returns {Promise} Axios promise.
 */
export const saveCourse = (courseId) => {
  return axiosPrivate.post('/saved-courses', { course_id: courseId });
};

/**
 * Unsaves a course for the authenticated user.
 * @param {string} courseId - The ID of the course to unsave.
 * @returns {Promise} Axios promise.
 */
export const unsaveCourse = (courseId) => {
  return axiosPrivate.delete(`/saved-courses/${courseId}`);
};

/**
 * Fetches all saved courses for the authenticated user.
 * (Optional: If you need to re-fetch saved courses outside of login)
 * @returns {Promise} Axios promise.
 */
export const getSavedCourses = () => {
  return axiosPrivate.get('/saved-courses');
};
