import React, { useState, useEffect } from 'react'; // Add useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import { createLecturer } from '../../services/lecturer';
import { uploadEntityImage } from '../../services/fileService'; // Import uploadEntityImage
import { toast } from 'react-hot-toast';

// Define a default placeholder for the lecturer image
const DEFAULT_LECTURER_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/128/682B44/FFFFFF?text=Lecturer'; // A distinct placeholder for lecturers

const AddLecturer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    bio: '',
    can_share_info: true,
    // profile_url: '', // REMOVED: No longer needed as image is uploaded separately
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW STATES FOR LECTURER IMAGE ---
  const [selectedImageFile, setSelectedImageFile] = useState(null); // The original file selected by user
  const [previewImageUrl, setPreviewImageUrl] = useState(DEFAULT_LECTURER_IMAGE_PLACEHOLDER); // State to hold the temporary URL for preview or the default
  const [imageUploadLoading, setImageUploadLoading] = useState(false); // Indicates if image upload is in progress
  const [imageUploadError, setImageUploadError] = useState(null); // Error specific to image upload
  // --- END NEW STATES ---

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // --- NEW onSelectFile HANDLER ---
  // Handles file selection, client-side validation, and sets up image preview
  const onSelectFile = (e) => {
    setImageUploadError(null); // Clear previous errors
    setSelectedImageFile(null); // Clear previously selected file
    setPreviewImageUrl(DEFAULT_LECTURER_IMAGE_PLACEHOLDER); // Reset preview to default

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Client-side validation: File type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setImageUploadError('Invalid file type. Only JPG, PNG, GIF, WEBP images are allowed.');
        return;
      }

      // Client-side validation: File size (1MB limit)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        setImageUploadError('Image size exceeds 1MB. Please choose a smaller image.');
        return;
      }

      setSelectedImageFile(file); // Store the original file for upload
      setPreviewImageUrl(URL.createObjectURL(file)); // Create a temporary URL for immediate preview
    }
  };
  // --- END NEW onSelectFile HANDLER ---

  // --- NEW useEffect FOR URL CLEANUP ---
  // Revokes the temporary object URL when the component unmounts or the preview changes
  useEffect(() => {
    return () => {
      // Only revoke if it's an object URL to avoid errors with static URLs
      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);
  // --- END NEW useEffect ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start main form loading
    setError(null); // Clear general form errors
    setImageUploadError(null); // Clear image upload errors on new submission attempt

    let newLecturerId = null;

    try {
      // Step 1: Create the lecturer record in the backend
      const lecturerResponse = await createLecturer(formData);
      // Assuming the API returns the ID of the newly created lecturer
      newLecturerId = lecturerResponse.data.lecturer.id;

      if (!newLecturerId) {
        throw new Error("Failed to get new lecturer ID from response.");
      }

      // Step 2: If an image was selected, upload it using the new lecturer's ID
      if (selectedImageFile) {
        setImageUploadLoading(true); // Start image upload loading
        toast.loading('Uploading lecturer image...', { id: 'lecturerImageUploadToast' });
        try {
          // uploadEntityImage expects (file, id, entityType)
          await uploadEntityImage(selectedImageFile, newLecturerId, 'lecturer'); // Entity type is 'lecturer'
          toast.success('Lecturer image uploaded successfully!', { id: 'lecturerImageUploadToast' });
        } catch (imageErr) {
          console.error("Error uploading lecturer image:", imageErr.response?.data || imageErr.message);
          setImageUploadError(imageErr.response?.data?.message || 'Failed to upload lecturer image.');
          toast.error(imageErr.response?.data?.message || 'Failed to upload lecturer image.', { id: 'lecturerImageUploadToast' });
          // Note: The lecturer record is still created even if the image upload fails.
          // You might choose to roll back lecturer creation or inform the user accordingly.
        } finally {
          setImageUploadLoading(false); // End image upload loading
        }
      }

      toast.success('Lecturer created successfully!'); // General success toast for lecturer creation

      // Navigate based on 'from' state or to default manage page
      const fromPath = location.state?.from;
      if (fromPath) {
        navigate(fromPath);
      } else {
        navigate('/manage-lecturers');
      }

    } catch (err) {
      console.error('Error creating lecturer:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to create lecturer. Please check your input.';
      setError(errorMessage); // Set form-specific error
      toast.error(errorMessage); // Show error toast
    } finally {
      setLoading(false); // End main form loading
      setSelectedImageFile(null); // Clear selected file after submission
      setPreviewImageUrl(DEFAULT_LECTURER_IMAGE_PLACEHOLDER); // Reset preview image
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 mt-10 border border-gray-200 rounded-lg shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">Add New Lecturer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* --- NEW LECTURER PHOTO SECTION --- */}
        <div className="flex flex-col items-center mb-4">
          <label className="mb-1 font-semibold text-gray-700">Lecturer Photo:</label>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg mb-3">
            {/* Display the temporary preview image or the default placeholder */}
            <img
              src={previewImageUrl}
              alt="Lecturer Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="file"
            id="lecturerImageInput"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={onSelectFile}
            className="hidden" // Hide the default file input button
          />
          <button
            type="button" // Important: use type="button" to prevent this button from submitting the form
            onClick={() => document.getElementById('lecturerImageInput').click()} // Trigger hidden input click
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition-all duration-300 font-semibold text-sm"
          >
            {selectedImageFile ? 'Change Selected Photo' : 'Select Photo'}
          </button>
          {imageUploadError && (
            <p className="text-red-500 text-sm mt-2 text-center">{imageUploadError}</p>
          )}
        </div>
        {/* --- END NEW LECTURER PHOTO SECTION --- */}

        <div className="flex flex-col">
          <label htmlFor="username" className="mb-1 font-semibold text-gray-700">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-semibold text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="mb-1 font-semibold text-gray-700">Phone:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="bio" className="mb-1 font-semibold text-gray-700">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          ></textarea>
        </div>

        {/* Removed the old profile_url input field */}

        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="can_share_info"
            name="can_share_info"
            checked={formData.can_share_info}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="can_share_info" className="font-semibold text-gray-700">Can Share Info</label>
        </div>

        {error && <p className="text-red-600 text-center mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading || imageUploadLoading} // Disable if either form submission or image upload is in progress
          className="mt-6 py-3 px-6 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? 'Creating Lecturer...' : (imageUploadLoading ? 'Uploading Image...' : 'Create Lecturer')}
        </button>
        <button
          type="button"
          onClick={() => {
            const fromPath = location.state?.from;
            if (fromPath) {
              navigate(fromPath);
            } else {
              navigate('/manage-lecturers');
            }
          }}
          className="py-3 px-6 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition-colors duration-200 shadow-md"
        >
          Back to List
        </button>
      </form>
    </div>
  );
};

export default AddLecturer;
