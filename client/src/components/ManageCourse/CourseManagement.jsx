// src/pages/CourseManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useCourses } from '../../context/CourseContext';
import { updateCourse, hardDeleteCourse } from '../../services/courseService';
import { updateSubCourse, hardDeleteSubCourse } from '../../services/subCoursesService';
import CourseManagementCard from './CourseManagementCard';
import ConfirmationDialog from '../UserEnrollmentAndSubscription/ConfirmationDialog';
import { getFileStreamUrl } from '../../services/fileService';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { nestedCourses: allCourses, isLoading, isError, error, refetchCourses } = useCourses();

  const [allRenderableItems, setAllRenderableItems] = useState([]);
  const [draftItems, setDraftItems] = useState([]);
  const [publishedItems, setPublishedItems] = useState([]);
  const [itemThumbnails, setItemThumbnails] = useState({});
  // New state for filtering within sections
  const [draftFilter, setDraftFilter] = useState('all'); // 'all', 'course', 'subCourse'
  const [publishedFilter, setPublishedFilter] = useState('all'); // 'all', 'course', 'subCourse'

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);


  useEffect(() => {
    // Check if allCourses (which is the object returned from the backend) and its properties exist
    if (allCourses && allCourses.mainCourses && allCourses.independentSubCourses) {
      const tempAllRenderableItems = [];
      const tempDraftItems = [];
      const tempPublishedItems = [];

      // Process Main Courses and their nested Sub-Courses
      allCourses.mainCourses.forEach(course => {
        // Add the main course itself to the renderable list
        tempAllRenderableItems.push(course);
        if (course.status === 'draft') {
          tempDraftItems.push(course);
        } else if (course.status === 'published') {
          tempPublishedItems.push(course);
        }

        // Accessing nested subCourses
        if (course.subCourses && Array.isArray(course.subCourses)) {
          course.subCourses.forEach(sub => {
            const subCourseWithMetadata = {
              ...sub,
              isSubCourse: true, // Flag to identify sub-courses
              parentCourseId: course.id, // Link to its parent main course
              parentCourseTitle: course.title
            };
            tempAllRenderableItems.push(subCourseWithMetadata);

            if (sub.status === 'draft') {
              tempDraftItems.push(subCourseWithMetadata);
            } else if (sub.status === 'published') {
              tempPublishedItems.push(subCourseWithMetadata);
            }
          });
        }
      });

      // Process Independent Sub-Courses
      allCourses.independentSubCourses.forEach(sub => {
        const subCourseWithMetadata = {
          ...sub,
          isSubCourse: true, // Flag as a sub-course
          // No parentCourseId or parentCourseTitle for independent sub-courses
          // This ensures they are treated as distinct sub-courses at the top level
        };
        tempAllRenderableItems.push(subCourseWithMetadata);

        if (sub.status === 'draft') {
          tempDraftItems.push(subCourseWithMetadata);
        } else if (sub.status === 'published') {
          tempPublishedItems.push(subCourseWithMetadata);
        }
      });

      setAllRenderableItems(tempAllRenderableItems);
      setDraftItems(tempDraftItems);
      setPublishedItems(tempPublishedItems);
    }
  }, [allCourses]);

  // Fetch thumbnails for all renderable items
  useEffect(() => {
    const fetchThumbnails = async () => {
      const newThumbnails = {};
      const promises = allRenderableItems.map(async (item) => {
        // Only fetch if we don't already have the URL for this item in state
        // or if it was null (meaning it was fetched and not found previously)
        if (itemThumbnails[item.id] === undefined) { // Check for undefined to avoid re-fetching if already null
          const url = await getFileStreamUrl(item.id, 'image');
          newThumbnails[item.id] = url;
        }
      });
      await Promise.all(promises);
      // Update state, merging new thumbnails with existing ones
      setItemThumbnails(prevThumbnails => ({ ...prevThumbnails, ...newThumbnails }));
    };

    if (allRenderableItems.length > 0) { // Only run if there are items to process
      fetchThumbnails();
    }
  }, [allRenderableItems]);

  // Filter items based on the selected filter type
  const getFilteredItems = (items, filterType) => {
    if (filterType === 'all') {
      return items;
    } else if (filterType === 'course') {
      return items.filter(item => !item.isSubCourse); // Main courses don't have isSubCourse or it's false
    } else if (filterType === 'subCourse') {
      return items.filter(item => item.isSubCourse);
    }
    return items; // Default to all if filterType is unrecognized
  };

  const handleAddSubCourse = () => {
    navigate('/manage-course/add-sub-course');
  };

  const handleAddMainCourse = () => {
    navigate('/manage-course/add-main-course');
  };

  const handleUploadCourseMaterials = () => {
    navigate('/upload-course-materials');
  };

  const handleDeleteClick = (itemId) => {
    setItemToDeleteId(itemId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;

    setShowDeleteConfirm(false);
    toast.loading('Deleting item...', { id: 'deleteToast' });

    try {
      // Determine if it's a sub-course ID based on hyphens
      // Assuming Course ID: 'COURSE-001' (1 hyphen, 2 parts)
      // Assuming Sub-Course ID: 'SUB-COURSE-001-01' (3 hyphens, 4 parts)
      const idParts = itemToDeleteId.split('-');
      const isSubCourseId = idParts.length === 4; // Check for 3 hyphens (4 parts)

      if (isSubCourseId) {
        await hardDeleteSubCourse(itemToDeleteId); // Call new sub-course hard delete
        toast.success('Sub-course deleted successfully!', { id: 'deleteToast' });
      } else {
        await hardDeleteCourse(itemToDeleteId); // Call existing course hard delete
        toast.success('Course deleted successfully!', { id: 'deleteToast' });
      }

      refetchCourses(); // Assuming this refetches both courses and sub-courses
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error(err.response?.data?.message || 'Failed to delete item.', { id: 'deleteToast' });
    } finally {
      setItemToDeleteId(null);
    }
  };

  const handleUpdateClick = async (itemId) => {
    const itemToUpdate = allRenderableItems.find(item => item.id === itemId);
    if (!itemToUpdate) {
      toast.error('Item not found for update.');
      return;
    }
      if (itemToUpdate.isSubCourse) {
        toast('Opening sub-course edit form...', { icon: '✏️' });
        // Navigate to AddNewSubCourse page, passing the sub-course data
        navigate('/manage-course/add-sub-course', { state: { courseInfo: itemToUpdate } });
      } else {
        // MODIFIED: Handle draft main courses by navigating to AddNewMainCourse for editing
        toast('Opening main course edit form...', { icon: '✏️' });
        // Navigate to AddNewMainCourse page, passing the main course data
        navigate('/manage-course/add-main-course', { state: { courseInfo: itemToUpdate } });
      }
  };

const handleStatusChange = async (itemId, newStatus) => {
    const itemToUpdate = allRenderableItems.find(item => item.id === itemId);
    if (!itemToUpdate) {
      toast.error('Item not found for status update.');
      return;
    }

    toast.loading(`Setting status to ${newStatus}...`, { id: 'statusChangeToast' });

    try {
      if (itemToUpdate.isSubCourse) {
        await updateSubCourse(itemId, { status: newStatus });
        toast.success(`Sub-course status set to ${newStatus}!`, { id: 'statusChangeToast' });
      } else {
        await updateCourse(itemId, { status: newStatus });
        toast.success(`Course status set to ${newStatus}!`, { id: 'statusChangeToast' });
      }
      refetchCourses(); // Refresh data to reflect status change
    } catch (err) {
      console.error('Error changing item status:', err.response?.data?.message);
      toast.error(err.response?.data?.message || `Failed to set status to ${newStatus}.`, { id: 'statusChangeToast' });
    }
  };
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center text-xl font-medium text-gray-700">
        <div className="flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading courses...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
        <p className="mb-2">Error: {error ? error.message : 'An unknown error occurred while fetching courses.'}</p>
        <button onClick={refetchCourses} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const filteredDraftItems = getFilteredItems(draftItems, draftFilter);
  const filteredPublishedItems = getFilteredItems(publishedItems, publishedFilter);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      <Toaster />
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
        Course Management
      </h1>

      <div className="flex flex-col md:flex-row justify-center mb-10 space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={handleAddSubCourse}
          className="bg-green-600 text-white px-6 py-3 rounded-full text-sm md:text-md font-semibold shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Add New Sub-course</span>
        </button>
        <button
          onClick={handleAddMainCourse}
          className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm md:text-md font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Add New Main Course</span>
        </button>
        <button
          onClick={handleUploadCourseMaterials}
          className="bg-yellow-600 text-black px-6 py-3 rounded-full text-sm md:text-md font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>Upload Course Materials</span>
        </button>
      </div>


      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">
            Draft Items ({filteredDraftItems.length})
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setDraftFilter('all')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${draftFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setDraftFilter('course')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${draftFilter === 'course'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Courses
            </button>
            <button
              onClick={() => setDraftFilter('subCourse')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${draftFilter === 'subCourse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Sub-courses
            </button>
          </div>
        </div>
        {filteredDraftItems.length === 0 ? (
          <p className="text-gray-600 italic">No draft items available for this filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDraftItems.map(item => (
              <CourseManagementCard
                key={item.id}
                course={item}
                image={itemThumbnails[item.id]}
                onDelete={handleDeleteClick}
                onUpdate={handleUpdateClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">
            Published Items ({filteredPublishedItems.length})
          </h2>
          <div className="flex space-x-1 md:space-x-2">
            <button
              onClick={() => setPublishedFilter('all')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${publishedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setPublishedFilter('course')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${publishedFilter === 'course'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Courses
            </button>
            <button
              onClick={() => setPublishedFilter('subCourse')}
              className={`px-2 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold transition-colors duration-200 ${publishedFilter === 'subCourse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Sub-courses
            </button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 text-sm">
          <p>
            <span className="font-semibold">Note:</span> Updating a published course has limitations. You cannot add/delete sub-courses, modules, and lectures.
            You can only update course details like title, description, thumbnail, price, and category.
            To make structural changes, please contact admin.
          </p>
        </div>
        {filteredPublishedItems.length === 0 ? (
          <p className="text-gray-600 italic">No published items available for this filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPublishedItems.map(item => (
              <CourseManagementCard
                key={item.id}
                course={item}
                image={itemThumbnails[item.id]}
                onUpdate={handleUpdateClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to permanently delete this draft item? This action cannot be undone."
      />
    </div>
  );
};

export default CourseManagement;
