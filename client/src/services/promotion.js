// src/services/promotionService.js
import axios, { axiosPrivate } from './axios'; // Assuming axiosPrivate is configured for authenticated requests

export const addPromotion = (promotionData) => {
  // This will send a POST request to /api/promotions
  return axiosPrivate.post('/promotions', promotionData);
};

export const updatePromotion = (promotionId, promotionData) => {
  // This will send a PUT request to /api/promotions/:id
  return axiosPrivate.put(`/promotions/${promotionId}`, promotionData);
};

export const deletePromotion = (promotionId) => {
  // This will send a DELETE request to /api/promotions/:id
  return axiosPrivate.delete(`/promotions/${promotionId}`);
};

export const getAllPromotions = () => {
  // This will send a GET request to /api/promotions
  // The backend will separate them into running and scheduled
  return axios.get('/promotions');
};
