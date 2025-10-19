// src/services/lectureService.js
import axios, { axiosPrivate } from './axios';

export const createLecture = (lectureData) => {
  return axiosPrivate.post('/lectures', lectureData);
};

export const getLecturesByModule = (moduleId) => {
  return axios.get(`/lectures/module/${moduleId}`);
};

export const updateLecture = (lectureId, lectureData) => {
  return axiosPrivate.put(`/lectures/${lectureId}`, lectureData);
};

export const deleteLecture = (lectureId) => {
  return axiosPrivate.delete(`/lectures/${lectureId}`);
};

export const deleteAllLecturesByModule = (moduleId) => {
  return axiosPrivate.delete(`/lectures/by-module/${moduleId}`);
};