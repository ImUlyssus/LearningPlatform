// src/services/lecturer.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Fetches all lecturers. By default, this will typically fetch non-deleted lecturers.
 */
export const getAllLecturers = () => {
  return axios.get('/lecturers');
};

/**
 * Fetches a single lecturer by their ID.
 * @param {number} lecturerId - The ID of the lecturer to fetch.
 */
export const getLecturerById = (lecturerId) => {
  return axios.get(`/lecturers/${lecturerId}`);
};
/**
 * Searches for a lecturer by email.
 * @param {string} email - The email of the lecturer to search for.
 * @returns {Promise<object>} A promise that resolves to the lecturer object if found.
 */
export const searchLecturerByEmail = (email) => {
  return axiosPrivate.get(`/lecturers/search/${email}` );
};

/**
 * Creates a new lecturer.
 * @param {object} lecturerData - The data for the new lecturer.
 */
export const createLecturer = (lecturerData) => {
  return axiosPrivate.post('/lecturers', lecturerData);
};

/**
 * Updates an existing lecturer.
 * @param {number} lecturerId - The ID of the lecturer to update.
 * @param {object} lecturerData - The updated data for the lecturer.
 */
export const updateLecturer = (lecturerId, lecturerData) => {
  return axiosPrivate.put(`/lecturers/${lecturerId}`, lecturerData);
};

/**
 * "Deletes" a lecturer by setting their 'is_deleted' status to true.
 * @param {number} lecturerId - The ID of the lecturer to soft delete.
 */
export const deleteLecturer = (lecturerId) => {
  // We'll use a PUT request to update the 'is_deleted' status on the backend.
  // The backend will handle setting is_deleted to true.
  return axiosPrivate.put(`/lecturers/${lecturerId}/soft-delete`);
};

/**
 * Recovers a soft-deleted lecturer by setting their 'is_deleted' status to false.
 * @param {number} lecturerId - The ID of the lecturer to recover.
 */
export const recoverLecturer = (lecturerId) => {
  // This assumes a PUT endpoint on the backend to change is_deleted back to false.
  return axiosPrivate.put(`/lecturers/${lecturerId}/recover`);
};
