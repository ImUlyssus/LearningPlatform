import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useCourses } from '../../context/CourseContext';
import { Bookmark, Gift } from 'lucide-react';
import { saveCourse, unsaveCourse } from '../../services/savedCoursesService';
import { getFileStreamUrl, getEntityImageStreamUrl } from '../../services/fileService';
import { getCurrentUser } from '../../services/userService';
import { NORMAL_ROLE, GOOGLE_FORM_LINK, FACEBOOK_CONTACT_LINK } from '../../constants';
import EnrollmentInstructionsDialog from '../EnrollmentInstructionsDialog/EnrollmentInstructionsDialog';
import DefaultThumbnail from '../../assets/default-thumbnail.png';
import DefaultProfile from '../../assets/default-profile.png'
function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { nestedCourses, activePromotions, isLoading, isError, error } = useCourses();
  const [courseData, setCourseData] = useState(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [lecturersInfo, setLecturersInfo] = useState([]);
  const [currentLecturerIndex, setCurrentLecturerIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isOneYearMember, setIsOneYearMember] = useState(false);
  const [hasVideoLoadError, setHasVideoLoadError] = useState(false);
  const [mainCourseThumbnailUrl, setMainCourseThumbnailUrl] = useState(null);
  const [subCourseThumbnails, setSubCourseThumbnails] = useState({});
  const [mainCourseVideoUrl, setMainCourseVideoUrl] = useState(null);
  const [currentLecturerProfileImageUrl, setCurrentLecturerProfileImageUrl] = useState(DefaultProfile);
  
    // Helper function to update derived states based on user data
  const updateDerivedStates = (userData, currentId) => {
    const saved = userData.saved_courses?.some(
      (savedCourse) => String(savedCourse.course_id) === String(currentId)
    );
    setIsSaved(saved);

    const enrolled = userData.enrolled_courses?.some(
      (enrolledCourse) => String(enrolledCourse.course_id) === String(currentId)
    );
    setIsEnrolled(enrolled);

    if (userData.one_yr_membership && userData.membership_start_date) {
      const startDate = new Date(userData.membership_start_date);
      const currentDate = new Date();
      const oneYearFromStartDate = new Date(startDate);
      oneYearFromStartDate.setFullYear(startDate.getFullYear() + 1);
      setIsOneYearMember(currentDate <= oneYearFromStartDate);
    } else {
      setIsOneYearMember(false); // Ensure it's false if membership details are missing or invalid
    }
  };


  useEffect(() => {
    // Reset video load error whenever the course ID changes
    setHasVideoLoadError(false);
  }, [id]);
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (courseData && courseData.id) {
        const url = await getFileStreamUrl(courseData.id, 'image');
        setMainCourseThumbnailUrl(url);
      } else {
        setMainCourseThumbnailUrl(null); // Clear if no courseData
      }
    };
    fetchThumbnail();
  }, [courseData]); // Dependency on courseData will re-run this when courseData changes
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (courseData && courseData.id) {
        const url = await getFileStreamUrl(courseData.id, 'video');
        setMainCourseVideoUrl(url);
      } else {
        setMainCourseVideoUrl(null); // Clear if no courseData
      }
    };
    fetchVideoUrl();
  }, [courseData]);

  // NEW EFFECT: Fetch sub-course thumbnail URLs
  useEffect(() => {
    const fetchSubThumbnails = async () => {
      if (courseData && courseData.subCourses && courseData.subCourses.length > 0) {
        const urls = {};
        for (const subCourse of courseData.subCourses) {
          if (subCourse.id) {
            const url = await getFileStreamUrl(subCourse.id, 'image');
            urls[subCourse.id] = url;
          }
        }
        setSubCourseThumbnails(urls);
      } else {
        setSubCourseThumbnails({}); // Clear if no sub-courses
      }
    };
    fetchSubThumbnails();
  }, [courseData]);
    // Existing useEffect: Load user from localStorage and update derived states
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      updateDerivedStates(parsedUser, id); // Use the helper function here
    }
  }, [id]); // Depend on 'id' so it re-runs if course ID changes
  // New useEffect: Check URL for 'refresh' flag and fetch latest user data
    // New useEffect: Check URL for 'refresh' flag and fetch latest user data
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldRefresh = queryParams.get('refresh') === 'true';

    const fetchLatestUserData = async () => {
      try {

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No authentication token found. Cannot fetch latest user data.");
            return;
        }
        // Use your new service function to fetch the latest user data
        const response = await getCurrentUser(); // This returns the Axios response object

        // Axios automatically parses JSON, so the user data is in response.data
        const freshUser = response.data;

        setUser(freshUser); // Update the component's user state
        localStorage.setItem('user', JSON.stringify(freshUser)); // Update localStorage
        updateDerivedStates(freshUser, id); // Recalculate derived states with the fresh data

      } catch (error) {
        console.error("Error fetching latest user data:", error);
        // Axios errors have a 'response' property if it's an HTTP error
        if (error.response) {
          if (error.response.status === 401) {
            console.warn("User session expired or invalid token. Please log in again.");
            // Clear local storage and redirect to login page
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.error(`Server responded with status ${error.response.status}:`, error.response.data);
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received from server:", error.request);
        } else {
          // Something else happened in setting up the request
          console.error("Error setting up request:", error.message);
        }
        // If fetching fails, the component will fall back to displaying data from localStorage (if any)
      }
    };

    if (shouldRefresh) {
      fetchLatestUserData();
    }
  }, [location.search, id, navigate]); // Added 'navigate' to dependencies as it's used inside the effect



  // UPDATED EFFECT: Calculate discount based on active promotions from nestedCourses
  useEffect(() => {
    // Access activePromotions from nestedCourses
    const activePromotions = nestedCourses?.activePromotions;

    if (!activePromotions || !id) return; // Wait for data and course ID

    let calculatedDiscount = 0;
    const currentDateTime = new Date();

    activePromotions.forEach(promotion => {
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);
      // Check if promotion is currently active based on dates
      // Note: Using currentDateTime < endDate ensures it's active *before* the end date,
      // if you want to include the end date, use currentDateTime <= endDate
      if (currentDateTime >= startDate && currentDateTime < endDate) {
        if (promotion.course_id === 'ALL_COURSES') {
          calculatedDiscount += promotion.promotion_amount / 100; // Add as decimal
        } else {
          try {
            // promotion.course_id is a JSON string of an array of IDs
            const promoCourseIds = JSON.parse(promotion.course_id);
            // console.log(promoCourseIds, id)
            if (Array.isArray(promoCourseIds) && promoCourseIds.includes(id)) {
              calculatedDiscount += promotion.promotion_amount / 100; // Add as decimal
            }
          } catch (e) {
            console.error("Error parsing promotion course_id:", promotion.course_id, e);
          }
        }
      }
    });
    // Cap the total discount at 1 (100%) to prevent negative prices
    setDiscount(Math.min(calculatedDiscount, 1));
  }, [nestedCourses, id]);

  const toggleSavedCourse = async () => { // Made async
    if (!user || !id) {
      if (!user || !id) {
        // Use toast.error() for warning messages
        toast.error("Please log in to save courses.", {
          // You can override default options for this specific toast if needed
          icon: '⚠️', // Custom icon for warning
          style: {
            background: '#FFC107', // Yellow background
            color: '#333',         // Dark text
          },
        });
        return;
      }
    }

    try {
      let updatedSavedCourses;
      let newIsSavedState;

      if (isSaved) {
        // Unsave the course
        await unsaveCourse(id); // API call to unsave
        updatedSavedCourses = user.saved_courses.filter(
          (savedCourse) => String(savedCourse.course_id) !== String(id)
        );
        newIsSavedState = false;
        toast.success('Course removed from saved courses.');
      } else {
        // Save the course
        await saveCourse(id); // API call to save
        updatedSavedCourses = [
          ...(user.saved_courses || []),
          { course_id: String(id) } // Add new course_id, ensuring it's a string
        ];
        newIsSavedState = true;
        toast.success('Course added to saved courses!');
      }

      // Update local state and localStorage ONLY after successful API call
      setIsSaved(newIsSavedState);
      const updatedUser = { ...user, saved_courses: updatedSavedCourses };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error) {
      console.error('Error toggling saved course:', error);
      // Handle error (e.g., show a notification to the user)
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`); // Simple alert for demonstration
      } else {
        alert('An unexpected error occurred while saving/unsaving the course.');
      }
    }
  };

  const formatDuration = (minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${minutes} Mins`;
    if (remainingMinutes === 0) return `${hours} Hrs`;
    return `${hours} Hrs ${remainingMinutes} Mins`;
  };

  const formatCost = (cost) => {
    if (cost === 0) return 'Free';
    if (typeof cost === 'number') {
      return `MMK${cost.toLocaleString()}`;
    }
    return cost;
  };


  useEffect(() => {
    if (nestedCourses && id) {
      let foundMainCourse = null;

      // Search only within the mainCourses array
      foundMainCourse = (nestedCourses.mainCourses || []).find(course => String(course.id) === id);

      setCourseData(foundMainCourse);

      // --- NEW LECTURER DATA PROCESSING FOR MAIN COURSE ---
      if (foundMainCourse && nestedCourses.lecturers && nestedCourses.lecturersMap) {
        // Find all unique lecturer IDs associated with this main course or any of its sub-courses
        const relevantLecturerIds = new Set();

        nestedCourses.lecturersMap.forEach(mapEntry => {
          // Check if the course_id in lecturersMap starts with the main course's ID
          // This captures lecturers for the main course itself and all its sub-courses
          if (String(mapEntry.course_id).startsWith(String(foundMainCourse.id))) {
            relevantLecturerIds.add(mapEntry.lecturer_id);
          }
        });

        // Convert Set to Array and find the actual lecturer objects
        const foundLecturers = nestedCourses.lecturers.filter(lecturer =>
          relevantLecturerIds.has(lecturer.id)
        );
        setLecturersInfo(foundLecturers);
      } else {
        setLecturersInfo([]); // Reset if no course or lecturer data is available
      }
    } else {
      setCourseData(null);
      setLecturersInfo([]); // Reset if nestedCourses or id is null
    }
  }, [id, nestedCourses, navigate]); // Add navigate to dependencies if using the redirect logic

  
  
  const shouldShowEnrollButton = (user?.user_role == NORMAL_ROLE || !user) && !isEnrolled && !isOneYearMember;

  // ... rest of your component
  const currentLecturer = lecturersInfo.length > 0
    ? lecturersInfo[currentLecturerIndex]
    : null;
  const discountedPrice = courseData?.cost && ((courseData.cost != 45000 && discount != 0) ? courseData.cost * (1 - 0.05 - discount) :
    (courseData.cost != 45000 && discount == 0) ? courseData.cost * 0.9 : (courseData.cost == 45000 && discount != 0) ? courseData.cost * (1 - discount) : 45000)
  const bioDisplay = (currentLecturer && currentLecturer.bio)
    ? (showFullBio ? currentLecturer.bio : truncateText(currentLecturer.bio, 200))
    : '';

// Effect to reset current lecturer index when lecturersInfo changes (e.g., new course loaded)
  useEffect(() => {
    setCurrentLecturerIndex(0);
  }, [lecturersInfo]);

  useEffect(() => {
    const fetchLecturerImage = async () => {
      if (currentLecturer && currentLecturer.id) { // This condition is crucial
        try {
          const imageUrl = await getEntityImageStreamUrl(currentLecturer.id, 'lecturer');
          setCurrentLecturerProfileImageUrl(imageUrl || DefaultProfile);
        } catch (err) {
          console.error("Error fetching lecturer profile image:", err);
          setCurrentLecturerProfileImageUrl(DefaultProfile); // Fallback to default on error
        }
      } else {
        setCurrentLecturerProfileImageUrl(DefaultProfile); // Reset to default if no current lecturer
      }
    };

    fetchLecturerImage();
  }, [currentLecturer]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center text-xl font-medium text-gray-700">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading course details...
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

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center text-xl font-medium text-gray-700 bg-white rounded-lg shadow-md">
          Course not found. Please check the URL or try again.
        </div>
      </div>
    );
  }

  const overviewDisplay = showFullOverview ? courseData.overview : truncateText(courseData.overview, 300);
  
  function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster />
      <header className="bg-white shadow-sm pb-3 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[#2B4468] text-md md:text-3xl font-extrabold tracking-tight text-center">
            {courseData.title}
          </h1>
        </div>
      </header>

      {/* Changed grid-cols-2 to grid-cols-5 and added col-span classes */}
      <main className="max-w-7xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 lg:gap-x-4">
        {/* First Column - md:col-span-3 for 3/5 width */}
        <div className="space-y-3 md:space-y-6 lg:col-span-3">
          {/* Discount Info Section */}

          {discount > 0 && courseData && courseData.cost && (
            <section>
              <div className="relative overflow-hidden p-3 md:p-5 rounded-lg shadow-xl text-white
                            gradient-purple-to-pink
                            flex items-center gap-3">
                <div className="flex-shrink-0">
                  {/* Icon to draw attention */}
                  <Gift className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="flex-grow text-left">
                  {/* Attention-grabbing headline */}
                  <p className="text-xs md:text-base font-semibold uppercase mb-1">
                    We are now giving special offer!
                  </p>
                  {/* Prominent discount percentage */}
                  <p className="text-md md:text-xl lg:text-2xl font-extrabold leading-tight">
                    Get {courseData.cost == 45000 ? "" : "an additional"} <span className="text-yellow-300">{(discount * 100).toFixed(0)}% OFF</span>
                  </p>
                  {/* Clear message about the final price */}
                  <p className="text-xs md:text-sm mt-1">
                    Your new price: {formatCost(discountedPrice)}
                  </p>
                </div>
                {/* Optional: Add a subtle overlay for more visual interest */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')] pointer-events-none"></div>
              </div>
            </section>
          )}

          {/* Video and Price/Enroll */}
          <section className="bg-white rounded-lg shadow-md p-2 md:p-4">
            <div className="mb-4 sm:mb-6 h-45 sm:h-80 md:h-96 lg:h-[22rem]">
              {(() => {
                // Fetch the main course video URL (this is okay to keep as direct call, as it's not the 'image' causing the loop)
                if (mainCourseVideoUrl) { // Check if the URL has been fetched and is available
                  return (
                    <video
                      poster={mainCourseThumbnailUrl || DefaultThumbnail}
                      className="w-full h-full object-cover rounded-lg"
                      controls
                      src={mainCourseVideoUrl} // <--- UPDATED: Use the state variable here
                      title={courseData.title + " course video"}
                      onError={(e) => { e.target.onerror = null; e.target.poster = DefaultThumbnail; console.error("Video playback error:", e); }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                } else {
                  // This block handles:
                  // 1. mainCourseVideoUrl is null (either not yet fetched, or file not found)
                  // 2. You might also want a separate state for actual video playback errors if needed
                  return (
                    <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold p-4 text-center">
                      {/* Add a loading indicator while video URL is being fetched */}
                      {!mainCourseVideoUrl && courseData && courseData.id && (
                        <>
                          <p className="mb-2">
                            <span className="text-red-500 mr-2 text-3xl">⚠️</span>
                            Video not available for this course.
                          </p>
                          <p className="text-sm text-gray-500">
                            Please check back later or contact support if you believe this is an error.
                          </p>
                        </>
                      )}
                    </div>
                  );
                }
              })()}
            </div>

            <div className="flex flex-row items-center justify-between gap-3">
              <p className="font-bold text-green-600 text-md md:text-2xl lg:text-3xl text-nowrap">
                {formatCost(courseData.cost)}
              </p>
              <div className="flex items-center gap-3"> {/* Wrapper for Save and Enroll buttons */}
                {/* Save Button with Lucid Icon - UPDATED */}
                <button
                  onClick={toggleSavedCourse} // Attach the new function
                  className={`shrink-0 rounded-[10px] md:rounded-[15px] border
                           ${isSaved
                      ? 'border-blue-600 bg-blue-100 text-blue-600' // Style when saved
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50' // Style when not saved
                    }
                           px-3 py-1.5 text-xs
                           md:px-4 md:py-2 md:text-lg
                           flex items-center justify-center gap-1
                           transition duration-300 ease-in-out transform hover:scale-105`}
                >
                  <Bookmark className="w-4 h-4 md:w-6 md:h-6" fill={isSaved ? '#4C8BE6' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'} {/* Change text based on status */}
                </button>

                {/* Enroll Now Button - UPDATED (conditional rendering) */}
                {shouldShowEnrollButton &&
                  <button
                    onClick={() => setShowEnrollmentDialog(true)}
                    className="shrink-0 rounded-[10px] md:rounded-[15px] bg-blue-600 hover:bg-blue-700 text-white
                             px-3 py-1.5 text-xs
                             md:px-8 md:py-3 md:text-lg
                             transition duration-300 ease-in-out transform hover:scale-105"
                  // You would add an onClick handler for enrollment here
                  >
                    Enroll Now
                  </button>
                }
              </div>
            </div>
            {/* New Discount Information Row */}
            {courseData.cost && courseData.cost !== 45000 && ( // Only show if cost is available
              <div className="mt-3 mb-2 md:mt-4 text-center bg-green-50 p-1 md:p-2 rounded-md border border-blue-200">
                <p className="text-green-800 text-[10px] md:text-base font-semibold">
                  Buy full course and get {discount ? '5' : '10'}% discount!
                </p>
              </div>
            )}
          </section>

          {/* Sub-Courses */}
          {courseData.subCourses && courseData.subCourses.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
              <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Its Specialized Courses</h2>
              <div className="flex overflow-x-auto pb-3 sm:pb-4 -mx-2 hide-scrollbar">
                {courseData.subCourses.map((subCourse) => {
                  // UPDATED: Get URL from the state object
                  const subCourseThumbnailUrl = subCourseThumbnails[subCourse.id];

                  return (
                    <div
                      key={subCourse.id}
                      className="flex flex-col flex-shrink-0 w-64 sm:w-72 md:w-80 bg-gray-50 rounded-lg shadow-md overflow-hidden mx-2 border border-gray-200 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <img
                        src={subCourseThumbnailUrl || DefaultThumbnail} // <--- UPDATED
                        alt={subCourse.title}
                        className="w-full h-36 sm:h-40 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = DefaultThumbnail; }} // Fallback if image fails
                      />
                      <div
                        // Add 'flex', 'flex-col', and 'flex-grow' to the content div
                        className="p-3 sm:p-4 flex flex-col flex-grow"
                      >
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1">{subCourse.title}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3">{formatDuration(subCourse.duration)}</p>
                        <button
                          onClick={() => navigate(`/sub-course/${subCourse.id}`)} // Navigate to the new sub-course detail route
                          // Add 'mt-auto' to the button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base transition-colors mt-auto"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          )}
          {/* Lecturer Information Section */}
      {/* Ensure the outer conditional checks for currentLecturer being an actual object */}
      {lecturersInfo.length > 0 && currentLecturer && (
        <section className="bg-white rounded-lg shadow-md p-2 md:p-3">
          <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Lecturer Information</h2>

          {/* Lecturer Name and Image */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 py-2">
              <img
                src={currentLecturerProfileImageUrl}
                alt={currentLecturer?.username} // Keep optional chaining for defensive coding
                className="w-10 h-10 sm:w-[30px] sm:h-[30px] md:w-15 md:h-15 rounded-full object-cover border-4 border-blue-200"
              />
              <h3 className="text-md md:text-xl font-bold text-gray-900">
                {currentLecturer?.username} {/* Keep optional chaining */}
              </h3>
            </div>

            <hr className="border-t border-gray-200 my-2" />

            {/* Lecturer Bio */}
            {currentLecturer?.bio && ( // Keep optional chaining
              <p className="text-gray-700 text-xs sm:text-base leading-relaxed text-justify mb-4">
                {bioDisplay}
                {/* currentLecturer.bio.length is safe here because of the currentLecturer?.bio check above */}
                {currentLecturer.bio.length > 200 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-xs sm:text-base text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            )}

            <hr className="border-t border-gray-200 my-2" />

            {/* Contact Information (conditional based on can_share_info) */}
            {currentLecturer?.can_share_info && ( // Keep optional chaining
              <p className="text-gray-600 text-[12px] md:text-sm leading-relaxed pb-4">
                This lecturer is open to group and individual coaching. If you are interested you can contact the lecturer at{' '}
                {currentLecturer?.email && ( // Keep optional chaining
                  <a href={`mailto:${currentLecturer.email}`} className="hover:underline font-medium">
                    {currentLecturer.email}
                  </a>
                )}
                {currentLecturer?.email && currentLecturer?.phone && currentLecturer.phone.trim() !== '' && ( // Keep optional chaining
                  <span className="mx-1">|</span>
                )}
                {currentLecturer?.phone && currentLecturer.phone.trim() !== '' && ( // Keep optional chaining
                  <span className="font-medium">{currentLecturer.phone}</span>
                )}{' '}
                for more details.
              </p>
            )}
          </div>
          {/* Pagination Dots */}
          {lecturersInfo.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {lecturersInfo.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentLecturerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200
                              ${index === currentLecturerIndex ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Show lecturer ${index + 1}`}
                ></button>
              ))}
            </div>
          )}
        </section>
      )}
        </div>

        {/* Second Column - md:col-span-2 for 2/5 width */}
        <div className="space-y-6 sm:space-y-8 mt-6 lg:mt-0 lg:col-span-2">
          {/* Course Overview */}
          <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Course Overview</h2>
            <p className="text-gray-700 text-xs md:text-sm leading-snug sm:leading-relaxed whitespace-pre-line text-justify">
              {overviewDisplay}
              {courseData.overview && courseData.overview.length > 300 && (
                <button
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="text-xs md:text-base text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showFullOverview ? 'Read Less' : 'Read More'}
                </button>
              )}
            </p>
          </section>

          {/* What You Will Learn */}
          {(courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0) || (courseData.what_you_will_learn && courseData.what_you_will_learn.length > 0) ? (
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
              <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What You Will Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {(courseData.what_you_will_learn).map((item, index) => (
                  <div key={index} className="flex items-start text-gray-700 text-xs md:text-sm">
                    <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Skills */}
          {(courseData.skillsGained && courseData.skillsGained.length > 0) || (courseData.skills && courseData.skills.length > 0) ? (
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
              <h2 className="text-md md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Skills You Will Gain</h2>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {(courseData.skillsGained || courseData.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm hover:bg-blue-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      {/* NEW: Enrollment Instructions Dialog */}
      <EnrollmentInstructionsDialog
        isOpen={showEnrollmentDialog}
        onClose={() => setShowEnrollmentDialog(false)} // Function to close the dialog
        normalPrice={courseData.cost}
        discountedPrice={discountedPrice}
        formLink={GOOGLE_FORM_LINK}
        facebookLink={FACEBOOK_CONTACT_LINK}
      />
    </div>
  );
}

export default CourseDetail;
