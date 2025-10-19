// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ManagePeople from './ManagePeople'; // Adjust path as needed
import Promotion from './Promotion'; // Adjust path as needed
import Recovery from './Recovery'; // Adjust path as needed

import { getLecturers, getManagers, removeManager } from '../../services/userService'; // Removed getLecturers, removeLecturer
import { getAllLecturers, deleteLecturer } from '../../services/lecturer'; // New service for lecturers
import { addPromotion, updatePromotion, deletePromotion, getAllPromotions } from '../../services/promotion'; // Corrected import path
import { getCourses, recoverCourse } from '../../services/courseService'; // Added softDeleteCourse, recoverCourse
import { useCourses } from '../../context/CourseContext';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('manage-people');
  const {
    nestedCourses,
    isLoading: coursesLoading, // Renamed to avoid conflict with AdminPanel's general loading
    isError: coursesError,     // Renamed
    error: coursesErrorObj     // Renamed
  } = useCourses();

  // Manage people
  const [managers, setManagers] = useState([]);
  const [lecturers, setLecturers] = useState([]); // Will hold non-deleted lecturers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Promotions
  const [runningPromotions, setRunningPromotions] = useState([]);
  const [scheduledPromotions, setScheduledPromotions] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]); // Courses with is_deleted: false

  // Recovery
  const [deletedCourses, setDeletedCourses] = useState([]); // Courses with is_deleted: true
  // Removed deletedLecturers from state as they will be managed in Recovery component if needed.

  // Helper function to refresh all promotion lists
  const refreshPromotions = async () => {
    try {
      const response = await getAllPromotions(); // Single call to fetch both
      setRunningPromotions(response.data.runningPromotions || []);
      setScheduledPromotions(response.data.scheduledPromotions || []);
    } catch (refreshError) {
      console.error("Error refreshing promotions:", refreshError);
      // Optionally, show a non-blocking notification that lists might be out of sync
    }
  };

  // Helper function to refresh courses (active and deleted)
  // const refreshCourses = async () => {
  //   try {
  //     const coursesResponse = await getCourses(); // getCourses now fetches all (including deleted)
  //     const allCourses = coursesResponse.data.courses || [];

  //     // Filter courses for promotion (not deleted)
  //     const activeCourses = allCourses.filter(course => !course.is_deleted);
  //     setAvailableCourses(activeCourses);

  //     // Filter courses for recovery (deleted)
  //     const softDeletedCourses = allCourses.filter(course => course.is_deleted);
  //     setDeletedCourses(softDeletedCourses);
  //   } catch (courseError) {
  //     console.error("Error refreshing courses:", courseError);
  //     setError(prev => prev || "Failed to load course data."); // Set error if not already set
  //   }
  // };
  // UPDATED: Helper function to refresh courses (active and deleted)
  // Now processes data from useCourses context
  const refreshCourses = useCallback(() => {
    if (!nestedCourses) {
      // Data not yet loaded from context, or there's an error in context
      setAvailableCourses([]);
      setDeletedCourses([]);
      return;
    }

    const allFlatCourses = [];
    const deletedFlatCourses = [];

    // Process Main Courses
    nestedCourses.mainCourses.forEach(mainCourse => {
      // Add main course itself
      if (mainCourse.is_deleted) {
        deletedFlatCourses.push(mainCourse);
      } else {
        allFlatCourses.push(mainCourse);
      }

      // Add its sub-courses
      if (mainCourse.subCourses && mainCourse.subCourses.length > 0) {
        mainCourse.subCourses.forEach(subCourse => {
          if (subCourse.is_deleted) {
            deletedFlatCourses.push(subCourse);
          } else {
            allFlatCourses.push(subCourse);
          }
        });
      }
    });

    // Process Independent Sub-Courses
    nestedCourses.independentSubCourses.forEach(independentSubCourse => {
      if (independentSubCourse.is_deleted) {
        deletedFlatCourses.push(independentSubCourse);
      } else {
        allFlatCourses.push(independentSubCourse);
      }
    });

    setAvailableCourses(allFlatCourses);
    setDeletedCourses(deletedFlatCourses);
  }, [nestedCourses]);

  // Helper function to refresh lecturers (active and deleted)
  const refreshLecturers = async () => {
    try {
      // Assuming getAllLecturers now fetches all lecturers, and we filter here.
      // If your getAllLecturers already filters is_deleted: false, this can be simpler.
      const lecturersResponse = await getLecturers();
      const allLecturers = lecturersResponse.data.lecturers || [];

      // Filter for active lecturers for 'Manage people'
      setLecturers(allLecturers.filter(lecturer => !lecturer.is_deleted));
      // For recovery, the Recovery component will fetch/handle its own deleted lecturers
      // or we could pass them down if the Recovery component doesn't have its own fetch.
      // For now, we'll assume Recovery handles its own.
    } catch (lecturerError) {
      console.error("Error refreshing lecturers:", lecturerError);
      setError(prev => prev || "Failed to load lecturer data.");
    }
  };


  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch managers
        const managersResponse = await getManagers();
        setManagers(managersResponse.data.managers || []);

        // Fetch and filter lecturers
        await refreshLecturers();

        // Fetch and filter courses
        await refreshCourses();

        // Fetch all promotions
        await refreshPromotions();

      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.response?.data?.message || "Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Promotion handlers (no changes here, they call refreshPromotions)
  const handleAddPromotion = async (promotionData) => {
    try {
      const response = await addPromotion(promotionData);
      console.log('Promotion added successfully:', response.data);
      alert(`Promotion "${promotionData.title}" added successfully!`);
      await refreshPromotions();
    } catch (error) {
      console.error("Error adding promotion:", error);
      alert(`Failed to add promotion: ` + (error.response?.data?.message || 'Server error.'));
    }
  };

  const handleUpdatePromotion = async (promotionId, promotionData) => {
    try {
      const response = await updatePromotion(promotionId, promotionData);
      console.log('Promotion updated successfully:', response.data);
      alert(`Promotion "${promotionData.title}" updated successfully!`);
      await refreshPromotions();
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert(`Failed to update promotion: ` + (error.response?.data?.message || 'Server error.'));
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm(`Are you sure you want to delete promotion ID ${promotionId}?`)) {
      try {
        await deletePromotion(promotionId);
        console.log('Promotion deleted successfully:', promotionId);
        alert(`Promotion ID ${promotionId} deleted!`);
        await refreshPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        alert(`Failed to delete promotion: ` + (error.response?.data?.message || 'Server error.'));
      }
    }
  };

  // People handlers
  const handleAddManager = () => alert('Add new manager clicked!');
  const handleDeleteManager = async (id) => {
        try {
            await removeManager(id);
            setManagers(managers.filter(m => m.id !== id));
            alert(`Manager with ID ${id} demoted to normal user.`);
        } catch (error) {
            console.error("Error demoting manager:", error);
            alert(`Failed to demote manager with ID ${id}. ` + (error.response?.data?.message || 'Server error.'));
        }
    };

  const handleAddLecturer = () => alert('Add new lecturer clicked!');
  const handleDeleteLecturer = async (id) => {
        if (window.confirm(`Are you sure you want to soft-delete lecturer ID ${id}?`)) {
            try {
                await deleteLecturer(id); // Use the soft delete API
                alert(`Lecturer with ID ${id} soft-deleted.`);
                await refreshLecturers(); // Refresh active lecturers
                // For recovery, the Recovery component will need to refresh its list
            } catch (error) {
                console.error("Error soft-deleting lecturer:", error);
                alert(`Failed to soft-delete lecturer with ID ${id}. ` + (error.response?.data?.message || 'Server error.'));
            }
        }
    };

  // Recovery handlers
  const handleRecoverCourse = async (id) => {
    if (window.confirm(`Are you sure you want to recover course ID ${id}?`)) {
        try {
            await recoverCourse(id); // Assuming you have a recoverCourse service
            alert(`Course ID ${id} recovered.`);
            await refreshCourses(); // Refresh both active and deleted lists
        } catch (error) {
            console.error("Error recovering course:", error);
            alert(`Failed to recover course with ID ${id}. ` + (error.response?.data?.message || 'Server error.'));
        }
    }
  };

  // You will need a recoverLecturer function within the Recovery component itself,
  // or pass it down here if Recovery doesn't handle its own API calls.
  // For this setup, we'll assume Recovery will manage its own deleted lecturers.
  const handleRecoverLecturer = async (id) => {
    // This function might be removed if Recovery component handles its own lecturer recovery logic
    // For now, it's a placeholder if Recovery still expects it.
    console.log(`Attempting to recover lecturer ${id}`);
    // You would typically call a service like recoverLecturer(id) here
    // and then refresh the lecturer lists.
    alert(`Lecturer recovery for ID ${id} would be handled here.`);
    await refreshLecturers(); // Refresh active lecturers
  };


  const navItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'manage-people', name: 'Manage people' },
    { id: 'recovery', name: 'Recovery' },
    { id: 'promotion', name: 'Promotion' },
  ];
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white shadow-lg p-6 lg:p-8 flex-shrink-0">
        <nav>
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href="#"
                  onClick={() => setActiveSection(item.id)}
                  className={`block text-lg font-medium py-2 px-3 rounded-lg transition-colors
                    ${activeSection === item.id
                      ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {activeSection === 'manage-people' && (
          <ManagePeople
            managers={managers}
            lecturers={lecturers} // Pass active lecturers
            onAddManager={handleAddManager}
            onDeleteManager={handleDeleteManager}
            onAddLecturer={handleAddLecturer}
            onDeleteLecturer={handleDeleteLecturer}
          />
        )}

        {activeSection === 'promotion' && (
          <Promotion
            runningPromotions={runningPromotions}
            scheduledPromotions={scheduledPromotions}
            handleAddPromotion={handleAddPromotion}
            handleUpdatePromotion={handleUpdatePromotion}
            handleDeletePromotion={handleDeletePromotion}
            availableCourses={availableCourses} // Pass only non-deleted courses
          />
        )}

        {activeSection === 'recovery' && (
          <Recovery
            // deletedLecturers is removed from here
            deletedCourses={deletedCourses} // Pass only deleted courses
            // onRecoverLecturer is removed from here or left as a placeholder
            onRecoverCourse={handleRecoverCourse}
          />
        )}

        {activeSection === 'dashboard' && (
          <div className="text-center text-gray-600 text-xl mt-20">
            Content for {activeSection.replace('-', ' ').toUpperCase()} section.
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
