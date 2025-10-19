// src/services/lecturerMapService.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Adds a new lecturer-course mapping.
 * @param {object} lecturerMapData - Object containing course_id and lecturer_id.
 * @returns {Promise} Axios promise.
 */
export const addLecturerMap = (lecturerMapData) => {
  // This will send a POST request to /api/lecturermaps
  return axiosPrivate.post('/lecturermaps', lecturerMapData);
};

/**
 * Updates an existing lecturer-course mapping by ID.
 * @param {number} mapId - The ID of the mapping to update.
 * @param {object} lecturerMapData - Object containing updated course_id and/or lecturer_id.
 * @returns {Promise} Axios promise.
 */
export const updateLecturerMap = (mapId, lecturerMapData) => {
  // This will send a PUT request to /api/lecturermaps/:id
  return axiosPrivate.put(`/lecturermaps/${mapId}`, lecturerMapData);
};

/**
 * Deletes a lecturer-course mapping by ID.
 * @param {number} mapId - The ID of the mapping to delete.
 * @returns {Promise} Axios promise.
 */
export const deleteLecturerMap = (mapId) => {
  // This will send a DELETE request to /api/lecturermaps/:id
  return axiosPrivate.delete(`/lecturermaps/${mapId}`);
};

/**
 * Fetches all lecturer-course mappings.
 * @returns {Promise} Axios promise.
 */
export const getAllLecturerMaps = () => {
  // This will send a GET request to /api/lecturermaps
  return axios.get('/lecturermaps');
};

/**
 * Fetches a single lecturer-course mapping by ID.
 * @param {number} mapId - The ID of the mapping to fetch.
 * @returns {Promise} Axios promise.
 */
export const getLecturerMapById = (mapId) => {
  // This will send a GET request to /api/lecturermaps/:id
  return axios.get(`/lecturermaps/${mapId}`);
};

/**
 * Fetches all lecturer-course mappings for a specific course.
 * @param {string} courseId - The course ID to filter by.
 * @returns {Promise} Axios promise.
 */
export const getLecturerMapsByCourse = (courseId) => {
  // This will send a GET request to /api/lecturermaps/course/:courseId
  return axios.get(`/lecturermaps/course/${courseId}`);
};

/**
 * Fetches all lecturer-course mappings for a specific lecturer.
 * @param {number} lecturerId - The lecturer ID to filter by.
 * @returns {Promise} Axios promise.
 */
export const getLecturerMapsByLecturer = (lecturerId) => {
  // This will send a GET request to /api/lecturermaps/lecturer/:lecturerId
  return axios.get(`/lecturermaps/lecturer/${lecturerId}`);
};