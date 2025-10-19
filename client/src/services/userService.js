// src/services/user.js
import { axiosPrivate } from './axios'; // This imports the instance WITH the interceptor

export const getUserProfile = () => {
  return axiosPrivate.get(`/user/profile`);
};

export const updatePersonalInfo = (data) => {
  return axiosPrivate.put(`/user/personal-info`, data);
};

export const updateEmail = (data) => {
  return axiosPrivate.put(`/user/email`, data);
};

export const updatePassword = (data) => {
  return axiosPrivate.put(`/user/password`, data);
};

/**
 * Updates an existing user's data.
 * @param {number} userId - The ID of the user to update.
 * @param {object} userData - The updated data for the user.
 * @returns {Promise<object>} A promise that resolves to the updated user data.
 */
export const updateUser = (userId, userData) => {
  return axiosPrivate.put(`/user/${userId}`, userData);
};

export const searchUserByEmail = (email) => {
  // This assumes a GET endpoint like /api/users/search?email=example@domain.com
  // The backend should return a user object if found, e.g., { user: { id: '...', name: '...' } }
  return axiosPrivate.get(`/user/search/${email}`);
};

export const addManager = (userId) => {
  // This assumes a POST endpoint like /api/managers with a body { userId: '...' }
  // The backend might return the newly created manager object or a success message.
  return axiosPrivate.post(`/user/managers`, { userId });
};

export const addLecturer = (userId) => {
  // This assumes a POST endpoint like /api/lecturers with a body { userId: '...' }
  // The backend might return the newly created lecturer object or a success message.
  return axiosPrivate.post(`/user/lecturers`, { userId });
};

export const removeManager = (userId) => {
  // This will send a PUT request to demote a manager to a normal user
  return axiosPrivate.put(`/user/managers/remove`, { userId });
};

export const removeLecturer = (userId) => {
  // This will send a PUT request to demote a lecturer to a normal user
  return axiosPrivate.put(`/user/lecturers/remove`, { userId });
};

// Fetch all users with manager role
export const getManagers = () => {
  return axiosPrivate.get(`/user/managers`);
};

// Fetch all users with lecturer role
export const getLecturers = () => {
  return axiosPrivate.get(`/user/lecturers`);
};

export const getCurrentUser = () => {
  // This endpoint will return the currently authenticated user's full profile
  // including enrolled courses, saved courses, and membership details.
  return axiosPrivate.get(`/user/me`);
};