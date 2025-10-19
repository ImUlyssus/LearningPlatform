// src/api/axios.js (or wherever you manage your axios instances)
import axios from 'axios';

// Define your base URL once
// const BASE_URL = "http://localhost:3001/api"; // Make sure this matches your backend URL
// export const BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const BASE_URL = import.meta.env.DEV
  ? "http://localhost:3001/api" // The URL for local development
  : import.meta.env.VITE_API_URL || '/api';

// 1. axios: For public routes (e.g., login, register, forgot password)
// This instance does NOT include the token interceptor.
export default axios.create({
    baseURL: BASE_URL,
    // REMOVE THIS LINE: headers: { 'Content-Type': 'application/json' },
    // withCredentials: true // Only needed if you're using cookies/sessions and need to send them cross-origin
});

// 2. axiosPrivate: For protected routes (e.g., user profile, dashboards, CRUD operations)
// This instance WILL include the token interceptor.
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    // REMOVE THIS LINE: headers: { 'Content-Type': 'application/json' },
    // withCredentials: true // Only needed if you're using cookies/sessions and need to send them cross-origin
});

// A variable to store the navigate function
let navigateFunction = null;

// Function to set the navigate function from a React component
export const setNavigator = (navigator) => {
  navigateFunction = navigator;
};

// Request interceptor for axiosPrivate
// This will attach the JWT token to every request made with axiosPrivate
axiosPrivate.interceptors.request.use(
  (config) => {
    // Check if the Authorization header is already set (e.g., if you're retrying a request)
    // This prevents overwriting a potentially refreshed token or existing header
    if (!config.headers['Authorization']) {
      const token = localStorage.getItem('token'); // Get token from local storage

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for axiosPrivate to handle token expiration/invalidation
axiosPrivate.interceptors.response.use(
  (response) => response, // If response is successful, just return it
  async (error) => {
    const prevRequest = error.config;

    // If the error is 401 Unauthorized and it's not a retry (to prevent infinite loops)
    if (error.response?.status === 401 && !prevRequest._retry) { // Use optional chaining for error.response
      prevRequest._retry = true; // Mark as retried
      console.log("Token expired or invalid, redirecting to login...");

      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Clear user info too

      // --- THIS IS THE UPDATE ---
      if (navigateFunction) {
        navigateFunction('/login'); // Use the injected navigate function
      } else {
        // Fallback for cases where navigateFunction might not be set yet (e.g., initial load)
        // This will cause a full page reload, but ensures navigation.
        window.location.href = '/login';
      }
      // --- END UPDATE ---

      return Promise.reject(error); // Re-throw the error to be caught by the component
    }
    return Promise.reject(error); // For other errors, just re-throw
  }
);
