// src/services/moduleService.js
import axios, { axiosPrivate } from './axios';

export const createModule = (moduleData) => {
  return axiosPrivate.post('/modules', moduleData);
};
export const getModuleById = (moduleId) => {
  return axios.get(`/modules/${moduleId}`); // Added: Fetch a single module by ID
};
export const getModulesBySubCourse = (subCourseId) => {
  return axios.get(`/modules/sub-course/${subCourseId}`);
};

export const updateModule = (moduleId, moduleData) => {
  return axiosPrivate.put(`/modules/${moduleId}`, moduleData);
};

export const deleteModule = (moduleId) => {
  return axiosPrivate.delete(`/modules/${moduleId}`);
};
