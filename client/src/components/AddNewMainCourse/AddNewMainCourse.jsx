// src/pages/AddNewMainCourse.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

// Reused components
import CourseInfoCard from '../CourseCreationComponents/CourseInfoCard';
import SubCourseCard from './SubCourseCard';
import { getSubCoursesByMainCourseId } from '../../services/subCoursesService';
import { getFileStreamUrl } from '../../services/fileService'; // <--- ADD THIS IMPORT

const AddNewMainCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold the main course information
  const [mainCourseInfo, setMainCourseInfo] = useState(null);
  // State to hold related sub-courses
  const [relatedSubCourses, setRelatedSubCourses] = useState([]);

  // NEW STATE: To store fetched thumbnail URLs for sub-courses
  const [subCourseThumbnails, setSubCourseThumbnails] = useState({});

  // Derived state (no longer needed for adding sub-courses here, but kept for main course info)
  const hasMainCourseInfo = !!mainCourseInfo;

  // Function to fetch related sub-courses
  const fetchRelatedSubCourses = useCallback(async (mainCourseId) => {
    try {
      const response = await getSubCoursesByMainCourseId(mainCourseId);
      setRelatedSubCourses(response.data.subCourses);

      // NEW: Fetch thumbnails for these sub-courses
      const newThumbnails = {};
      const promises = response.data.subCourses.map(async (subCourse) => {
        const url = await getFileStreamUrl(subCourse.id, 'image');
        newThumbnails[subCourse.id] = url;
      });
      await Promise.all(promises);
      setSubCourseThumbnails(prevThumbnails => ({ ...prevThumbnails, ...newThumbnails }));

    } catch (error) {
      console.error('Error fetching related sub-courses:', error);
      toast.error('Failed to load related sub-courses.');
      setRelatedSubCourses([]);
      setSubCourseThumbnails({}); // Clear thumbnails on error
    }
  }, []);

  // Effect to load main course info if passed via navigation state
  // This happens when returning from the AddCourseInfoPage after saving/updating
  useEffect(() => {
    if (location.state && location.state.courseInfo) {
      setMainCourseInfo(location.state.courseInfo);
      toast.success('Main course information updated/loaded successfully!');
      // Fetch related sub-courses if main course ID is available
      if (location.state.courseInfo.id) {
        fetchRelatedSubCourses(location.state.courseInfo.id);
      }
      // Clear the state to prevent re-triggering on subsequent renders
      // and to ensure a clean state for future navigations
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, fetchRelatedSubCourses]);

  // Handler for adding/editing the main course's information
  const handleAddMainCourseInfo = () => {
    // Navigate to the AddCourseInfoPage to either create new main course info
    // or edit existing main course info.
    navigate('/add-course-info', {
      state: {
        courseInfo: mainCourseInfo, // Pass existing info if present, otherwise it will be null
        context: 'mainCourse',      // Explicitly set context to 'mainCourse'
      }
    });
  };

  // Handler for the back button
  const handleBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create/Edit Main Course</h1>

      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
        <p className="font-bold text-lg mb-2">Important Information:</p>
        <p className="text-md">
          To effectively manage your Main Course, first complete and save its information. Once the Main Course ID is established, this section will automatically display all associated Sub-Courses (e.g., 'YourMainCourseID-01', 'YourMainCourseID-02').
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Main Course Information</h2>
        {mainCourseInfo ? (
          <CourseInfoCard courseInfo={mainCourseInfo} onUpdate={handleAddMainCourseInfo} />
        ) : (
          <button
            onClick={handleAddMainCourseInfo}
            className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
            title="Add Main Course Information"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Associated Sub-Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {relatedSubCourses.length > 0 ? (
            relatedSubCourses.map(subCourse => (
              <SubCourseCard
                key={subCourse.id}
                subCourse={subCourse}
                image={subCourseThumbnails[subCourse.id]} // <--- PASS THE FETCHED IMAGE HERE
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">No associated sub-courses found. Sub-courses are linked automatically based on the Main Course ID once they are created.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default AddNewMainCourse;
