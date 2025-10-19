// src/services/certificateService.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Fetches a specific certificate by its ID.
 * @param {string} certificateId - The ID of the certificate to fetch.
 * @returns {Promise<object>} - A promise that resolves to the certificate data.
 */
export const getCertificateById = (certificateId) => {
  // This will send a GET request to /api/certificates/:id
  // axiosPrivate is used here as certificate viewing typically requires authentication
  return axios.get(`/certificates/${certificateId}`);
};

/**
 * Creates a new certificate record. This might be called by a backend process
 * upon course completion, or by an admin.
 * @param {object} certificateData - The data for the new certificate (e.g., course_id, user_id, score).
 * @returns {Promise<object>} - A promise that resolves to the newly created certificate data.
 */
export const createCertificate = (certificateData) => {
  // This will send a POST request to /api/certificates
  return axiosPrivate.post('/certificates', certificateData);
};

// You might add more functions here as needed, e.g., to get all certificates for a user
// export const getUserCertificates = (userId) => {
//   return axiosPrivate.get(`/certificates/user/${userId}`);
// };
