// src/pages/AddCourseInfoPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

// Import backend service functions
import { createCourse, updateCourse } from '../../services/courseService';
import { createSubCourse, updateSubCourse } from '../../services/subCoursesService';

const AddCourseInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we are editing an existing course/sub-course
  const existingInfo = location.state?.courseInfo;
  // Determine the context: 'mainCourse' or 'subCourse'
  const context = location.state?.context || 'mainCourse'; // Default to 'mainCourse'
  // Flag to indicate if it's an edit operation
  const isEditing = !!existingInfo;

  // State variables for form fields, initialized with existing data if editing
  const [idToManage, setIdToManage] = useState(existingInfo?.id || '');
  const [cost, setCost] = useState(existingInfo?.cost || '');
  const [title, setTitle] = useState(existingInfo?.title || '');
  const [overview, setOverview] = useState(existingInfo?.overview || '');
  // Category and Skills are stored as comma-separated strings in the input,
  // but converted to arrays for the backend.
  const [category, setCategory] = useState(Array.isArray(existingInfo?.category) ? existingInfo.category.join(', ') : '');
  // 'What you will learn' is an array of strings
  const [whatYouWillLearn, setWhatYouWillLearn] = useState(
    Array.isArray(existingInfo?.what_you_will_learn) && existingInfo.what_you_will_learn.length > 0
      ? existingInfo.what_you_will_learn
      : [''] // Start with one empty item if none exist
  );
  const [skills, setSkills] = useState(Array.isArray(existingInfo?.skills) ? existingInfo.skills.join(', ') : '');
  const [thumbnail, setThumbnail] = useState(existingInfo?.thumbnail || '');
  const [previewVideoLink, setPreviewVideoLink] = useState(existingInfo?.link || ''); // Backend uses 'link'

  // Handler to add a new "What you will learn" input field
  const handleAddLearnItem = () => {
    if (whatYouWillLearn.length < 6) { // Limit to 6 items
      setWhatYouWillLearn([...whatYouWillLearn, '']);
    } else {
      toast.error('You can add up to 6 "What you will learn" items.');
    }
  };

  // Handler to remove a "What you will learn" input field
  const handleRemoveLearnItem = (index) => {
    const updatedItems = whatYouWillLearn.filter((_, i) => i !== index);
    setWhatYouWillLearn(updatedItems);
  };

  // Handler to update the value of a specific "What you will learn" item
  const handleLearnItemChange = (index, value) => {
    const updatedItems = whatYouWillLearn.map((item, i) =>
      i === index ? value : item
    );
    setWhatYouWillLearn(updatedItems);
  };

  // Main form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regular expressions for ID validation
    const courseIdRegex = /^[A-Z]{3}-\d{4}-\d{3}$/;
    const subCourseIdRegex = /^[A-Z]{3}-\d{4}-\d{3}-\d{2}$/;

    // ID Format Validation
    if (!isEditing) { // Only validate format on creation, not on editing where ID is fixed.
      if (context === 'mainCourse') {
        if (!courseIdRegex.test(idToManage)) {
          toast.error("Course ID must be in 'XXX-0000-000' format (e.g., ABC-1234-567).");
          return; // Stop submission
        }
      } else if (context === 'subCourse') {
        if (!subCourseIdRegex.test(idToManage)) {
          toast.error("Sub-Course ID must be in 'XXX-0000-000-00' format (e.g., ABC-1234-567-89).");
          return; // Stop submission
        }
      }
    }

    // Format array fields from comma-separated strings and filter out empty items
    const formattedWhatYouWillLearn = whatYouWillLearn.filter(item => item.trim() !== '');
    const formattedSkills = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
    const formattedCategory = category.split(',').map(cat => cat.trim()).filter(cat => cat !== '');

    // Construct the payload for the API call
    let payload = {
      id: idToManage,
      title: title.trim(),
      thumbnail: thumbnail.trim(),
      skills: formattedSkills,
      overview: overview.trim(),
      what_you_will_learn: formattedWhatYouWillLearn,
      category: formattedCategory,
      cost: parseInt(cost, 10), // Ensure cost is an integer
      link: previewVideoLink.trim() === '' ? null : previewVideoLink, // Send null if empty
    };

    try {
      let res;
      if (context === 'subCourse') {
        // Handle Sub-Course creation/update
        if (isEditing) {
          res = await updateSubCourse(idToManage, payload);
          toast.success('Sub-course information updated successfully!');
        } else {
          res = await createSubCourse(payload);
          toast.success('Sub-course information saved successfully!');
        }
        // Navigate back to the AddNewSubCourse page with the updated info
        navigate('/manage-course/add-sub-course', { replace: true, state: { courseInfo: res.data.subCourse } });
      } else { // context === 'mainCourse'
        // Handle Main Course creation/update
        if (isEditing) {
          res = await updateCourse(idToManage, payload);
          toast.success('Course information updated successfully!');
        } else {
          res = await createCourse(payload);
          toast.success('Course information saved successfully!');
        }
        // Navigate back to the MultiSubCourseCreation page with the updated info
        navigate('/manage-course/add-main-course', { replace: true, state: { courseInfo: res.data.course } });
      }

    } catch (error) {
      console.error('Error saving/updating information:', error);
      // Display a user-friendly error message
      const errorMessage = error.response?.data?.message || 'Server error while saving/updating information.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {isEditing
          ? (context === 'subCourse' ? 'Edit Sub-Course Information' : 'Edit Course Information')
          : (context === 'subCourse' ? 'Add Sub-Course Information' : 'Add Course Information')}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
        {/* Course ID / Sub-Course ID */}
        <div className="mb-4">
          <label htmlFor="idToManage" className="block text-gray-700 text-sm font-bold mb-2">
            {context === 'subCourse' ? 'Sub-Course ID:' : 'Course ID:'}
          </label>
          <input
            type="text"
            id="idToManage"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={idToManage}
            onChange={(e) => setIdToManage(e.target.value)}
            required
            // Disable input if editing, as per the existing logic
            disabled={isEditing}
          />
          {isEditing && <p className="text-xs text-gray-500 mt-1">ID cannot be changed when editing.</p>}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Cost */}
        <div className="mb-4">
          <label htmlFor="cost" className="block text-gray-700 text-sm font-bold mb-2">Cost:</label>
          <input
            type="number"
            id="cost"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            min="0"
          />
        </div>

        {/* Thumbnail Link */}
        {/* <div className="mb-4">
          <label htmlFor="thumbnail" className="block text-gray-700 text-sm font-bold mb-2">Thumbnail Link (URL):</label>
          <input
            type="url"
            id="thumbnail"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            required
          />
        </div> */}

        {/* Course Preview Video Link */}
        {/* <div className="mb-4">
          <label htmlFor="previewVideoLink" className="block text-gray-700 text-sm font-bold mb-2">Course Preview Video Link (URL):</label>
          <input
            type="url"
            id="previewVideoLink"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={previewVideoLink}
            onChange={(e) => setPreviewVideoLink(e.target.value)}
            placeholder="e.g., https://youtube.com/watch?v=yourvideo"
          />
          <p className="text-xs text-gray-500 mt-1">Video upload coming soon. Please provide a direct link for now.</p>
        </div> */}

        {/* Overview */}
        <div className="mb-4">
          <label htmlFor="overview" className="block text-gray-700 text-sm font-bold mb-2">Overview:</label>
          <textarea
            id="overview"
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category (comma-separated):</label>
          <input
            type="text"
            id="category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Programming, Web Development, Design"
          />
        </div>

        {/* What you will learn (up to 6 items) */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">What you will learn (up to 6 items):</label>
          {whatYouWillLearn.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                value={item}
                onChange={(e) => handleLearnItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                required={index === 0} // Make the first item required
              />
              {/* Allow removing items if there's more than one */}
              {whatYouWillLearn.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLearnItem(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {/* Allow adding new items if less than 6 */}
          {whatYouWillLearn.length < 6 && (
            <button
              type="button"
              onClick={handleAddLearnItem}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Item
            </button>
          )}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <label htmlFor="skills" className="block text-gray-700 text-sm font-bold mb-2">Skills (comma-separated):</label>
          <input
            type="text"
            id="skills"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., React, JavaScript, CSS, HTML"
            required
          />
        </div>

        {/* Save/Update Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isEditing
              ? (context === 'subCourse' ? 'Update Sub-Course Information' : 'Update Course Information')
              : (context === 'subCourse' ? 'Save Sub-Course Information' : 'Save Course Information')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourseInfoPage;
