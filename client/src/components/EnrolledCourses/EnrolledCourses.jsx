import { useState, useEffect, useMemo } from 'react';
import CourseCard from '../CourseCard/CourseCard'; // Adjust path if your CourseCard is in a different location
import { useCourses } from '../../context/CourseContext'; // Assuming CourseContext is set up
import { getFileStreamUrl } from '../../services/fileService'; // <--- NEW IMPORT

const EnrolledCourses = () => {
  // `allCourses` will contain the nested data: { mainCourses: [], independentSubCourses: [] }
  const { nestedCourses: allCourses, isLoading, isError, error } = useCourses();

  // State to store enrolled course IDs from localStorage
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  // State to ensure localStorage data has been processed
  const [userLoaded, setUserLoaded] = useState(false);

  // State to manage the active filter: 'specialized' for sub-courses, 'comprehensive' for main courses
  const [activeFilter, setActiveFilter] = useState('specialized'); // Default to 'specialized' (sub-courses)

  // <--- NEW STATE FOR THUMBNAILS ---
  const [courseThumbnails, setCourseThumbnails] = useState({});
  // <--- END NEW STATE ---

  // Helper functions (reused from OurCoursesPage)
  const formatDuration = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return '';
    if (minutes < 60) return `${minutes} Mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} Hrs`;
    return `${hours} Hrs ${remainingMinutes} Mins`;
  };

  const formatCost = (cost) => {
    if (cost === 0) return 'Free';
    if (typeof cost === 'number') {
      return `MMK${cost.toLocaleString()}`; // Formats with commas
    }
    return cost;
  };

  // Effect to load enrolled course IDs from localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure enrolled_courses exists and is an array, then extract course_ids
      // Convert IDs to string for consistent comparison
      const ids = parsedUser.enrolled_courses?.map(enrolled => String(enrolled.course_id)) || [];
      setEnrolledCourseIds(ids);
    }
    setUserLoaded(true); // Mark user data as loaded, even if no user or no enrolled courses
  }, []);

  // Memoize the filtering logic to get actual course objects
  const { enrolledMainCourses, enrolledSubCourses } = useMemo(() => {
    // Return empty arrays if data is not ready or no enrolled IDs
    if (!allCourses || !allCourses.mainCourses || !allCourses.independentSubCourses || enrolledCourseIds.length === 0) {
      return { enrolledMainCourses: [], enrolledSubCourses: [] };
    }

    const mainCourses = [];
    const subCourses = [];

    // Create a map of all available courses (main and sub) for efficient lookup
    const courseMap = new Map();
    allCourses.mainCourses.forEach(mc => {
      courseMap.set(String(mc.id), mc);
      if (mc.subCourses) {
        mc.subCourses.forEach(sc => courseMap.set(String(sc.id), sc));
      }
    });
    allCourses.independentSubCourses.forEach(isc => courseMap.set(String(isc.id), isc));

    // Iterate through the enrolled IDs and find the corresponding course objects
    enrolledCourseIds.forEach(enrolledId => {
      const course = courseMap.get(enrolledId);
      if (course) {
        // Determine if it's a main course or sub-course based on its ID structure
        const hyphenCount = (enrolledId.match(/-/g) || []).length;
        if (hyphenCount === 2) { // Typically main course IDs have 2 hyphens (e.g., AML-0000-001)
          mainCourses.push(course);
        } else if (hyphenCount === 3) { // Typically sub-course IDs have 3 hyphens (e.g., AML-0000-001-01)
          subCourses.push(course);
        }
      }
    });

    return { enrolledMainCourses: mainCourses, enrolledSubCourses: subCourses };
  }, [allCourses, enrolledCourseIds]);

  // Determine which list of courses to display based on the active filter
  const coursesToDisplay = useMemo(() => {
    if (activeFilter === 'specialized') {
      return enrolledSubCourses;
    } else { // activeFilter === 'comprehensive'
      return enrolledMainCourses;
    }
  }, [activeFilter, enrolledMainCourses, enrolledSubCourses]);


  // <--- NEW useEffect FOR FETCHING THUMBNAILS ---
  useEffect(() => {
    const fetchThumbnails = async () => {
      const newThumbnails = {};
      const promises = coursesToDisplay.map(async (item) => {
        // Only fetch if we don't already have the URL for this item's ID
        if (!courseThumbnails[item.id]) {
          const url = await getFileStreamUrl(item.id, 'image'); // Fetch image using getFileStreamUrl
          newThumbnails[item.id] = url;
        }
      });
      await Promise.all(promises);
      // Update state, merging new thumbnails with existing ones
      setCourseThumbnails(prevThumbnails => ({ ...prevThumbnails, ...newThumbnails }));
    };

    // Only run if there are courses to display, user data is loaded, and not currently loading main course data
    if (coursesToDisplay.length > 0 && userLoaded && !isLoading) {
      fetchThumbnails();
    }
  }, [coursesToDisplay, userLoaded, isLoading]); // Add isLoading to dependencies
  // <--- END NEW useEffect ---


  // --- Loading, Error, and Initial Empty States ---
  if (isLoading || !userLoaded) { // Wait for both courses from context and user data from localStorage to load
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center text-xl font-medium text-gray-700">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your enrolled courses...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
          <p className="mb-2">Error: {error ? error.message : 'An unknown error occurred while fetching course details.'}</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!localStorage.getItem('user')) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-8">
          Your Enrolled Courses
        </h1>
        <p className="text-gray-600 text-lg">Please log in to view your enrolled courses.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-3 lg:mb-5">
        Your Enrolled Courses
      </h1>

      {/* Filter Tags - Option 2: Professional Blue/Navy */}
      <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-10">
        <button
            onClick={() => setActiveFilter('specialized')}
            className={`px-3 md:px-6 py-1.5 md:py-3 rounded-full font-semibold text-xs md:text-base transition-all duration-200 ease-in-out
            ${activeFilter === 'specialized'
                    ? 'bg-blue-800 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
        >
            Specialized Courses
        </button>
        <button
            onClick={() => setActiveFilter('comprehensive')}
            className={`px-3 md:px-6 py-1.5 md:py-3 rounded-full font-semibold text-xs md:text-base transition-all duration-200 ease-in-out
            ${activeFilter === 'comprehensive'
                    ? 'bg-blue-800 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
        >
            Comprehensive Programs
        </button>
      </div>

      {/* Conditional message for no courses */}
      {coursesToDisplay.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">
            You are not currently enrolled in any {' '}
            {activeFilter === 'specialized' ? 'specialized courses' : 'comprehensive programs'}.
          </p>
          <p className="text-md text-gray-500 mt-2">
            Explore our <a href="/our-courses" className="text-blue-600 hover:underline">available courses</a> to find your next learning path!
          </p>
        </div>
      ) : (
        /* Display Enrolled Courses */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {coursesToDisplay.map(item => (
            <CourseCard
              key={item.id}
              id={item.id}
              image={courseThumbnails[item.id]} // <--- UPDATED LINE: Pass the fetched thumbnail URL
              title={item.title}
              duration={formatDuration(item.duration)}
              description={item.overview}
              price={formatCost(item.cost)}
              // You might need to add a prop to CourseCard to indicate if it's a main course or sub-course
              // For navigation purposes, if your routing is different for them (e.g., /course/:id vs /sub-course/:id)
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
