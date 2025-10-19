// src/components/AdminPanel/Recovery.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useEffect
// Assuming you have these components
// import UserCard from '../UserCard/UserCard';
import CourseCard from '../CourseCard/CourseCard';

// NEW: Import lecturer service for recovery operations if Recovery component handles its own fetching
import { getAllLecturers, recoverLecturer as apiRecoverLecturer } from '../../services/lecturer'; // Assuming recoverLecturer exists in lecturerService

const Recovery = ({
  // removed deletedLecturers prop
  deletedCourses = [], // Only expecting deletedCourses now
  // removed onRecoverLecturer prop
  onRecoverCourse,
}) => {
  const [query, setQuery] = useState('');
  const [deletedLecturers, setDeletedLecturers] = useState([]); // State for deleted lecturers within Recovery
  const [loadingLecturers, setLoadingLecturers] = useState(true);
  const [lecturerError, setLecturerError] = useState(null);


  // Function to refresh deleted lecturers
  const refreshDeletedLecturers = async () => {
    try {
      setLoadingLecturers(true);
      setLecturerError(null);
      const response = await getAllLecturers(); // Assuming this fetches ALL lecturers (active + deleted)
      const allLecturers = response.data.lecturers || [];
      setDeletedLecturers(allLecturers.filter(l => l.is_deleted));
    } catch (err) {
      console.error("Error fetching deleted lecturers for recovery:", err);
      setLecturerError("Failed to load deleted lecturers.");
    } finally {
      setLoadingLecturers(false);
    }
  };

  // Fetch deleted lecturers on component mount or when needed
  useEffect(() => {
    refreshDeletedLecturers();
  }, []);


  const match = (value = '') =>
    query.toLowerCase() === '' || value.toLowerCase().includes(query.toLowerCase());


  // Filter courses based on query
  const filteredCourses = useMemo(
    () => deletedCourses.filter(c => match(c.title)),
    [deletedCourses, query]
  );

  // Filter lecturers based on query
  const filteredLecturers = useMemo(
    () => deletedLecturers.filter(l => match(l.username) || match(l.email)),
    [deletedLecturers, query]
  );

  // Handler for recovering a lecturer
  const handleRecoverLecturer = async (id) => {
    if (window.confirm(`Are you sure you want to recover lecturer ID ${id}?`)) {
        try {
            await apiRecoverLecturer(id); // Call the API service to recover
            alert(`Lecturer ID ${id} recovered.`);
            await refreshDeletedLecturers(); // Refresh the list of deleted lecturers
            // AdminPanel (root) might need to refresh its active lecturers too,
            // depending on how tightly coupled you want them.
            // For now, assume AdminPanel's refreshLecturers will be called when it's active.
        } catch (error) {
            console.error("Error recovering lecturer:", error);
            alert(`Failed to recover lecturer with ID ${id}. ` + (error.response?.data?.message || 'Server error.'));
        }
    }
  };


  return (
    <div className="space-y-10">
      {/* Header / Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Recovery</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deleted items..."
          className="w-full sm:w-80 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Deleted Courses */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Deleted Courses</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {filteredCourses.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCourses.length ? (
            filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                image={c.thumbnail} // Assuming CourseCard uses 'image' but model has 'thumbnail'
                title={c.title}
                duration={c.duration}
                description={c.description}
                price={c.cost} // Assuming CourseCard uses 'price' but model has 'cost'
                footerVariant="recover"
                onRecover={() => onRecoverCourse(c.id)}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">No deleted courses.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Recovery;
