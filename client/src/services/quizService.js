// src/services/quizService.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

/**
 * Creates a new quiz entry on the backend.
 * @param {object} quizData - Data for the new quiz (lecture_id, qa_data, min_score_to_pass).
 * @returns {Promise<AxiosResponse>} Axios promise for the POST request.
 */
export const createQuiz = (quizData) => {
  return axiosPrivate.post('/quizzes', quizData);
};

/**
 * Retrieves a quiz by its lecture_id from the backend.
 * @param {string} lectureId - The ID of the lecture associated with the quiz.
 * @returns {Promise<AxiosResponse>} Axios promise for the GET request.
 */
export const getQuizByLectureId = (lectureId) => {
  // Assuming quizzes might be publicly viewable or viewable by any authenticated user,
  // so using 'axios' (public) or 'axiosPrivate' (authenticated) as appropriate.
  // For this example, let's assume it might be accessed without specific roles.
  return axiosPrivate.get(`/quizzes/${lectureId}`);
};

/**
 * Updates an existing quiz on the backend.
 * @param {string} lectureId - The ID of the lecture associated with the quiz to update.
 * @param {object} updateData - Data to update the quiz with (e.g., qa_data, min_score_to_pass).
 * @returns {Promise<AxiosResponse>} Axios promise for the PUT request.
 */
export const updateQuiz = (lectureId, updateData) => {
  return axiosPrivate.put(`/quizzes/${lectureId}`, updateData);
};

/**
 * Deletes a quiz by its lecture_id on the backend.
 * @param {string} lectureId - The ID of the lecture associated with the quiz to delete.
 * @returns {Promise<AxiosResponse>} Axios promise for the DELETE request.
 */
export const deleteQuiz = (lectureId) => {
  return axiosPrivate.delete(`/quizzes/${lectureId}`);
};
