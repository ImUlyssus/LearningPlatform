// src/component/AddNewSubCourse/AddNewSubCourse.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

// Reused components from MultiSubCourseCreationPage
import CourseInfoCard from '../CourseCreationComponents/CourseInfoCard';
import LecturerCard from '../CourseCreationComponents/LecturerCard'; // Keep as is
import AddLecturerDialog from '../CourseCreationComponents/AddLecturerDialog'; // Keep as is
import { getModulesBySubCourse, deleteModule } from '../../services/moduleService';
import ModuleCard from './ModuleCard';

// Lecturer mapping service functions
import {
  getLecturerMapsByCourse, // To fetch existing mappings for a sub-course
  addLecturerMap,         // To create a new lecturer-course mapping
  deleteLecturerMap       // To delete an existing lecturer-course mapping
} from '../../services/lecturerMapService'; // Correct service for mappings

const AddNewSubCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [subCourseInfo, setSubCourseInfo] = useState(null);
  const [modules, setModules] = useState([]); // Placeholder for modules
  const [lecturers, setLecturers] = useState([]); // State to hold lecturers for this sub-course

  // State for showing the AddLecturerDialog
  const [showAddLecturerDialog, setShowAddLecturerDialog] = useState(false);

  // Derived state to control enabling/disabling related info sections
  const canAddRelatedInfo = !!subCourseInfo; // True if subCourseInfo is not null

  // Function to fetch lecturers for the current sub-course
  // This will be called when subCourseInfo is loaded or updated
  const fetchLecturers = useCallback(async (subCourseId) => {
    try {
      // getLecturerMapsByCourse should return an array of map entries,
      // each containing `id` (map ID) and `lecturer_details` (lecturer object).
      const fetchedLecturerMaps = await getLecturerMapsByCourse(subCourseId);
      setLecturers(fetchedLecturerMaps.data.lecturerMaps); // Assuming backend returns { data: { lecturerMaps: [...] } }
    } catch (error) {
      console.error('Error fetching lecturers for sub-course:', error);
      toast.error('Failed to load lecturers for this sub-course.');
    }
  }, []);

  // Function to fetch modules for the current sub-course
const fetchModules = useCallback(async (subCourseId) => {
  try {
    const fetchedModules = await getModulesBySubCourse(subCourseId);
    // Sort modules based on the last two digits of their ID
    const sortedModules = fetchedModules.data.modules.sort((a, b) => {
      // Function to extract the numeric part from the last segment of the ID
      const extractOrderNumber = (moduleId) => {
        const parts = moduleId.split('-');
        // Get the last part (e.g., '01', '02') and convert to an integer
        return parseInt(parts[parts.length - 1], 10); 
      };

      const orderA = extractOrderNumber(a.id);
      const orderB = extractOrderNumber(b.id);

      return orderA - orderB; // Sort in ascending order
    });

    setModules(sortedModules); 
  } catch (error) {
    console.error('Error fetching modules for sub-course:', error);
    toast.error('Failed to load modules for this sub-course.');
  }
}, []);

  useEffect(() => {
  if (location.state && location.state.courseInfo) {
    setSubCourseInfo(location.state.courseInfo);
    toast.success('Sub-course information updated/loaded successfully!');
    // Fetch lecturers only if we have a subCourseId
    if (location.state.courseInfo.id) {
      fetchLecturers(location.state.courseInfo.id);
      // NEW: Fetch modules for the sub-course
      fetchModules(location.state.courseInfo.id);
    }
    // Clear the state to prevent re-triggering on subsequent renders
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, navigate, location.pathname, fetchLecturers, fetchModules]); // Add fetchLecturers to dependency array

  // Handler for adding/editing the sub-course's own information
  const handleAddSubCourseInfo = () => {
    navigate('/add-course-info', {
      state: {
        courseInfo: subCourseInfo,
        context: 'subCourse',
      }
    });
  };

  // Handler for adding a lecturer (opens the AddLecturerDialog)
  const handleAddLecturer = () => {
    if (!canAddRelatedInfo) {
      toast.error('Please add sub-course information first to assign a lecturer.');
      return;
    }
    setShowAddLecturerDialog(true);
  };

  // Callback from AddLecturerDialog when a lecturer is selected/added
  const handleLecturerAddedToCourse = async (lecturer) => {
    setShowAddLecturerDialog(false); // Close the dialog

    if (!subCourseInfo || !subCourseInfo.id) {
      toast.error('Sub-course information is missing. Cannot assign lecturer.');
      return;
    }

    const subCourseId = subCourseInfo.id;
    const lecturerUserId = lecturer.id;

    // Check if lecturer is already assigned locally to prevent duplicate API calls
    const isAlreadyAssigned = lecturers.some(
      (mapEntry) => mapEntry.lecturer_details.id === lecturerUserId
    );
    if (isAlreadyAssigned) {
      toast.error('Lecturer is already assigned to this sub-course.');
      return;
    }

    try {
      // Call the service to add the mapping to the database
      const response = await toast.promise(
        addLecturerMap({
          course_id: subCourseId, // Use subCourseId as the course_id for the mapping
          lecturer_id: lecturerUserId
        }),
        {
          loading: 'Assigning lecturer...',
          success: 'Lecturer assigned successfully!',
          error: 'Failed to assign lecturer.'
        }
      );

      // Assuming the backend returns the newly created mapping with its primary key (id)
      // e.g., response.data.mapping = { id: 'map123', course_id: 'subC1', lecturer_id: 'L1' }
      const newMapping = response.data.mapping;

      // Update local state with the new mapping and the lecturer's details for display
      setLecturers(prev => {
        // Double-check to prevent duplicates if somehow the check above failed or race condition
        if (prev.some(mapEntry => mapEntry.id === newMapping.id)) {
          return prev;
        }
        // Store the full mapping object plus the lecturer_details for the LecturerCard
        return [...prev, { ...newMapping, lecturer_details: lecturer }];
      });
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      toast.error(error.response?.data?.message || 'Failed to assign lecturer.');
    }
  };

  // Handler for removing a lecturer
  const handleRemoveLecturer = async (mapEntryId) => {
    if (!canAddRelatedInfo) {
      toast.error('Cannot remove lecturer without sub-course information.');
      return;
    }
    try {
      await toast.promise(
        deleteLecturerMap(mapEntryId), // Use deleteLecturerMap from lecturerMapService
        {
          loading: 'Removing lecturer...',
          success: 'Lecturer removed successfully!',
          error: 'Failed to remove lecturer.'
        }
      );
      // Filter out the removed map entry from the local state
      setLecturers(prev => prev.filter(mapEntry => mapEntry.id !== mapEntryId));
    } catch (error) {
      console.error('Error removing lecturer:', error);
      toast.error(error.response?.data?.message || 'Failed to remove lecturer.');
    }
  };

  // Callback for "Create New Lecturer" button in the dialog
  const handleCreateNewLecturerNavigation = () => {
    // Navigate to the lecturer creation page, passing current path for potential return
    navigate('/manage-lecturers/add', { state: { from: location.pathname } });
  };


  // Modify the handleAddModule function:
const handleAddModule = () => {
  if (!canAddRelatedInfo) {
    toast.error('Please add sub-course information first.');
    return;
  }

  // Generate a unique module ID based on subCourseId and existing module count
  const nextModuleNumber = modules.length + 1;
  const newModuleId = `${subCourseInfo.id}-${String(nextModuleNumber).padStart(2, '0')}`;

  // Navigate to the add module page, passing the generated ID and sub-course ID
  navigate('/add-module', {
    state: {
      moduleId: newModuleId,
      subCourseId: subCourseInfo.id,
      // You can also pass existing module data if you want to support editing
      // context: 'create', // or 'edit' if editing an existing module
    }
  });
};

  // Placeholder for deleting a module
  const handleDeleteModule = async (moduleId) => { // Make it async
    if (!canAddRelatedInfo) {
      toast.error('Cannot delete module without sub-course information.');
      return;
    }

    try {
      await toast.promise(
        deleteModule(moduleId), // Call the deleteModule service
        {
          loading: 'Deleting module...',
          success: 'Module deleted successfully!',
          error: 'Failed to delete module.'
        }
      );

      // Update local state: filter out the deleted module
      setModules(prevModules => prevModules.filter(mod => mod.id !== moduleId));

    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error(error.response?.data?.message || 'Failed to delete module.');
    }
  };

  // Placeholder for updating a module
  // Example in a parent component like AddSubCoursePage.jsx or CourseManagementPage.jsx
// where you map over modules and render ModuleCard
// ...

const handleUpdateModule = (moduleId) => {
    // You MUST have access to the subCourseId in this scope.
    // For example, if you are on the AddSubCoursePage, `subCourseId` might be a state variable or a prop.
    // Let's assume you have a `currentSubCourseId` variable available.
    const currentSubCourseId = subCourseInfo?.id;

    if (!currentSubCourseId) {
        toast.error('Cannot update module: Parent sub-course ID is missing.');
        return;
    }

    navigate('/add-module', {
        state: {
            subCourseInfo,
            moduleId: moduleId, // The ID of the module to edit
            subCourseId: currentSubCourseId, // The ID of the parent sub-course
            isEditing: true // Crucial flag to tell AddModulePage it's an edit operation
        }
    });
};

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Sub-Course</h1>

      {/* Sub-Course Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sub-Course Information</h2>
        {subCourseInfo ? (
          <CourseInfoCard courseInfo={subCourseInfo} onUpdate={handleAddSubCourseInfo} />
        ) : (
          <button
            onClick={handleAddSubCourseInfo}
            className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
            title="Add Sub-Course Information"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        )}
      </div>

      {/* Course Lecturer(s) Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sub-Course Lecturer(s)</h2>
        <div className="flex flex-wrap items-start gap-4">
          {lecturers.map(mapEntry => (
            <LecturerCard
              key={mapEntry.id} // Use the mapEntry ID (from the join table) as the key
              lecturer={mapEntry.lecturer_details} // Pass the lecturer's details for display
              onRemove={() => handleRemoveLecturer(mapEntry.id)} // Pass the mapEntry ID to the removal handler
            />
          ))}
          <button
            onClick={handleAddLecturer}
            disabled={!canAddRelatedInfo}
            className={`flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg transition-colors
              ${canAddRelatedInfo ? 'border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-600' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'}`}
            title={canAddRelatedInfo ? "Add Lecturer" : "Please add sub-course information first"}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Modules for this Sub-Course</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              onDelete={() => handleDeleteModule(module.id)}
              onUpdate={() => handleUpdateModule(module.id)}
              isLastModule={index === modules.length - 1}
            />
          ))}
          <button
            onClick={handleAddModule}
            disabled={!canAddRelatedInfo}
            className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors
              ${canAddRelatedInfo ? 'border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-600' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'}`}
            title={canAddRelatedInfo ? "Add Module" : "Please add sub-course information first"}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>

      {/* Lecturer Search Dialog */}
      <AddLecturerDialog
        isOpen={showAddLecturerDialog}
        onClose={() => setShowAddLecturerDialog(false)}
        onAddLecturerSuccess={handleLecturerAddedToCourse}
        onCreateNewLecturerClick={handleCreateNewLecturerNavigation}
      />
    </div>
  );
};

export default AddNewSubCourse;
