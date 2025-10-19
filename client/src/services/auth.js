import axios from "./axios";


export const loginUser = (email, password) => {
  return axios.post(`/login`, { email, password });
};

export const registerUser = (data) => {
  return axios.post(`/register`, data);
};

export const verifyEmail = (token) => {
  return axios.get(`/verify-email?token=${token}`);
};

export const requestPasswordReset = (email) => {
  return axios.post(`/forgot-password`, { email });
};

export const resetPassword = (token, newPassword) => {
  return axios.post(`/reset-password`, { token, newPassword });
};
