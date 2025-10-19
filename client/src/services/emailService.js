// frontend/src/services/emailService.js (This file runs in the browser)
import axios, { axiosPrivate } from './axios'; // Assuming axios and axiosPrivate are configured

// Functions to send requests to your backend email API endpoints

export const sendContactUsEmail = (emailData) => {
  // emailData should contain: { userEmail, userName, userMessage }
  return axios.post('/email/contact-us', emailData); // Note: using axios for public endpoints
};

export const sendRegistrationVerificationEmail = (emailData) => {
  // emailData should contain: { userEmail, userName, verificationLink }
  return axios.post('/email/registration-verification', emailData);
};

export const sendCourseCompletionEmail = (emailData) => {
  // emailData should contain: { userEmail, userName, courseName, certificateLink, surveyLink }
  // This might require authentication if only logged-in users or specific backend triggers can send it
  return axiosPrivate.post('/email/course-completion', emailData);
};

export const sendCoursePurchaseEmail = (emailData) => {
  // emailData should contain: { userEmail, userName, courseName, orderId, purchaseDetails }
  // This likely requires authentication
  return axiosPrivate.post('/email/course-purchase', emailData);
};

export const sendForgotPasswordEmail = (emailData) => {
  // emailData should contain: { userEmail, userName, resetLink }
  return axios.post('/email/forgot-password', emailData);
};
