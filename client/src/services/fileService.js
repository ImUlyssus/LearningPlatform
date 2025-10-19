// src/services/fileService.js
import axios_lib from 'axios';
import axios, { axiosPrivate, BASE_URL } from './axios';

/**
 * Uploads a file to the server, renaming it to [id].[original_extension].
 *
 * @param {File} originalFile - The file object to upload.
 * @param {string} id - The ID of the course, sub-course, or lecture.
 * @returns {Promise} A promise that resolves with the upload response.
 */
export const uploadFile = async (originalFile, id) => {
  const formData = new FormData();

  // Extract original file extension
  const fileExtension = originalFile.name.split('.').pop();
  // Construct the new filename: [id].[original_extension]
  const newFileName = `${id}.${fileExtension}`;

  // Create a new File object with the desired newFileName
  // This ensures Multer's file.originalname will be the desired name.
  const fileToUpload = new File([originalFile], newFileName, { type: originalFile.type });

  formData.append('file', fileToUpload);

  // Axios automatically sets Content-Type to 'multipart/form-data' when FormData is used.
  // DO NOT explicitly set 'Content-Type' here.
  return await axiosPrivate.post('/files/upload', formData);
};

/**
 * Generates the URL for streaming a file, dynamically adjusting for environment.
 * The backend expects the file ID and the general file type (e.g., 'video', 'image', 'pdf', 'zip').
 *
 * @param {string} fileId - The ID of the course, sub-course, or lecture.
 * @param {string} fileType - The general type of the file (e.g., 'video', 'image', 'pdf', 'zip').
 * @returns {string} The full URL to the streamable file.
 */
// export const getFileStreamUrl = async (fileId, fileType) => {
//   const BASE_URL = process.env.NODE_ENV === 'production' ? '' : axios.defaults.baseURL;
//   const url = `${BASE_URL}/files/stream/${fileId}/${fileType}`;
//   try {
//     // Make a HEAD request to check if the file exists.
//     // A HEAD request is more efficient as it only asks for the response headers, not the full file content.
//     // Your backend's `streamFile` function currently supports GET, so we'll assume it will
//     // correctly respond to HEAD requests with a 200 if the file exists and a 404 if not.
//     // If HEAD is not supported by your backend, you might need to use a GET request and handle its error.
//     const response = await axios.head(url);

//     // If the HEAD request is successful (status 200), it means the file exists.
//     return url;
//   } catch (error) {
//     // UPDATED LINE: Use axios_lib for isAxiosError
//     if (axios_lib.isAxiosError(error) && error.response && error.response.status === 404) {
//       // console.log(`File type '${fileType}' with ID '${fileId}' not found on the server.`); // Keep commented out or adjust
//       return null;
//     }
//     console.error(`Error checking file existence for ${fileType} with ID ${fileId}:`, error);
//     return null;
//   }
// };
export const getFileStreamUrl = async (fileId, fileType) => {
  // --- SIMPLIFIED LOGIC ---
  const streamPath = `/files/stream/${fileId}/${fileType}`;
  const fullUrl = `${BASE_URL}${streamPath}`; // This is the final URL for the browser's src attribute

  try {
    // Use the relative path for the HEAD check. Axios will add the base URL automatically.
    await axios.head(streamPath);
    // If the check is successful, return the complete URL.
    return fullUrl;
  } catch (error) {
    if (axios_lib.isAxiosError(error) && error.response && error.response.status === 404) {
      return null;
    }
    console.error(`Error checking file existence for ${fileType} with ID ${fileId}:`, error);
    return null;
  }
};


// You can keep getPreviewUrl as an alias for getFileStreamUrl, or remove it.
export const getPreviewUrl = (fileId, fileType) => {
  return getFileStreamUrl(fileId, fileType);
};

/**
 * Deletes a file from the server.
 *
 * @param {string} fileName - The name of the file to delete (e.g., "myvideo.mp4").
 * @returns {Promise} A promise that resolves with the deletion response.
 */
export const deleteFile = (fileName) => {
  return axiosPrivate.delete('/files/delete', { data: { fileName } });
};


/**
 * Uploads an image for a user or lecturer, using their ID as the filename.
 * Replaces any existing image for that ID regardless of extension.
 *
 * @param {File} originalFile - The file object to upload.
 * @param {string} id - The ID of the user or lecturer (integer).
 * @param {'user' | 'lecturer'} entityType - The type of entity ('user' or 'lecturer').
 * @returns {Promise} A promise that resolves with the upload response.
 */
export const uploadEntityImage = async (originalFile, id, entityType) => {
  const formData = new FormData();

  // Extract original file extension
  const fileExtension = originalFile.name.split('.').pop();
  // Construct the new filename: [id].[original_extension]
  const newFileName = `${id}.${fileExtension}`; // Frontend still prepares this name

  // Create a new File object with the desired newFileName
  const fileToUpload = new File([originalFile], newFileName, { type: originalFile.type });

  formData.append('file', fileToUpload); // Only append the file

  // Send id and entityType as URL parameters to make them available in req.params
  return await axiosPrivate.post(`/files/upload-entity-image/${id}/${entityType}`, formData);
};

/**
 * Generates the URL for streaming a user or lecturer image.
 * The backend will search for common image extensions (jpg, png, gif, webp).
 *
 * @param {string} id - The ID of the user or lecturer.
 * @param {'user' | 'lecturer'} entityType - The type of entity ('user' or 'lecturer').
 * @returns {Promise<string|null>} The full URL to the image, or null if not found.
 */
// export const getEntityImageStreamUrl = async (id, entityType) => {
//   const BASE_URL = process.env.NODE_ENV === 'production' ? '' : axios.defaults.baseURL;
//   // The backend route will be /files/stream-entity-image/:id/:entityType
//   const url = `${BASE_URL}/files/stream-entity-image/${id}/${entityType}`;

//   try {
//     // Use HEAD request to check for existence without downloading the whole image
//     const response = await axios.head(url);
//     if (response.status === 200) {
//       return url;
//     }
//     return null;
//   } catch (error) {
//     // UPDATED LINE: Use axios_lib for isAxiosError
//     if (axios_lib.isAxiosError(error) && error.response && error.response.status === 404) {
//       // console.log(`Entity image for ${entityType} with ID ${id} not found.`); // Keep commented out or adjust
//       return null;
//     }
//     console.error(`Error checking entity image existence for ${entityType} with ID ${id}:`, error);
//     return null;
//   }
// };

export const getEntityImageStreamUrl = async (id, entityType) => {
  // --- SIMPLIFIED LOGIC ---
  const streamPath = `/files/stream-entity-image/${id}/${entityType}`;
  const fullUrl = `${BASE_URL}${streamPath}`; // Final URL for the browser

  try {
    // Let Axios handle the base URL for the HEAD check.
    await axios.head(streamPath);
    // If successful, return the full URL.
    return fullUrl;
  } catch (error) {
    if (axios_lib.isAxiosError(error) && error.response && error.response.status === 404) {
      return null;
    }
    console.error(`Error checking entity image existence for ${entityType} with ID ${id}:`, error);
    return null;
  }
};