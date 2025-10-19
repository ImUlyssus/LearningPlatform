import { useState, useEffect, useMemo } from 'react';
import CertificateCard from './CertificateCard'; // Adjust path if your CertificateCard is in a different location
import { useCourses } from '../../context/CourseContext'; // Assuming CourseContext is set up
import { getFileStreamUrl } from '../../services/fileService'; // Import getFileStreamUrl

const CompletionCertificates = () => {
    const { nestedCourses: allCourses, isLoading, isError, error } = useCourses();

    // State to store certificate objects from localStorage
    const [completedCertificates, setCompletedCertificates] = useState([]);
    // State to ensure localStorage data has been processed
    const [userLoaded, setUserLoaded] = useState(false);

    // State to manage the active filter: 'specialized' for sub-courses, 'comprehensive' for main courses
    const [activeFilter, setActiveFilter] = useState('specialized'); // Default to 'specialized'

    // State to store fetched thumbnail URLs for certificates
    const [certificateThumbnails, setCertificateThumbnails] = useState({}); // New state for thumbnails

    // Helper function for duration formatting (can be moved to a utility file if reused extensively)
    const formatDuration = (minutes) => {
        if (typeof minutes !== 'number' || minutes < 0) return '';
        if (minutes < 60) return `${minutes} Mins`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours} Hrs`;
        return `${hours} Hrs ${remainingMinutes} Mins`;
    };

    // Effect to load certificates from localStorage when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Ensure certificates exists and is an array
                const certificates = parsedUser.certificates || [];
                setCompletedCertificates(certificates);
            } catch (e) {
                console.error("Failed to parse user data from localStorage:", e);
                setCompletedCertificates([]);
            }
        }
        setUserLoaded(true); // Mark user data as loaded
    }, []);

    // Memoize the filtering logic to get actual course objects linked with their certificates
    const { completedMainCourses, completedSubCourses } = useMemo(() => {
        if (!allCourses || !allCourses.mainCourses || !allCourses.independentSubCourses || completedCertificates.length === 0) {
            return { completedMainCourses: [], completedSubCourses: [] };
        }

        const mainCoursesWithCert = [];
        const subCoursesWithCert = [];

        // Create a map of all available courses (main and sub) for efficient lookup by course_id
        const courseMap = new Map();
        allCourses.mainCourses.forEach(mc => {
            courseMap.set(String(mc.id), mc);
            if (mc.subCourses) {
                mc.subCourses.forEach(sc => courseMap.set(String(sc.id), sc));
            }
        });
        allCourses.independentSubCourses.forEach(isc => courseMap.set(String(isc.id), isc));

        // Iterate through the completed certificates and find the corresponding course objects
        completedCertificates.forEach(certificate => {
            const course = courseMap.get(String(certificate.course_id)); // Ensure course_id is string for map key
            if (course) {
                // Determine if it's a main course or sub-course based on its ID structure
                const hyphenCount = (String(course.id).match(/-/g) || []).length; // Check hyphens in course.id
                const courseInfoWithCert = {
                    course: course,
                    certificateId: certificate.id, // Pass the certificate's own ID
                };

                if (hyphenCount === 2) { // Typically main course IDs have 2 hyphens (e.g., AML-0000-001)
                    mainCoursesWithCert.push(courseInfoWithCert);
                } else if (hyphenCount === 3) { // Typically sub-course IDs have 3 hyphens (e.g., AML-0000-001-01)
                    subCoursesWithCert.push(courseInfoWithCert);
                }
            }
        });

        return { completedMainCourses: mainCoursesWithCert, completedSubCourses: subCoursesWithCert };
    }, [allCourses, completedCertificates]);

    // Determine which list of courses to display based on the active filter
    const coursesToDisplay = useMemo(() => {
        if (activeFilter === 'specialized') {
            return completedSubCourses;
        } else { // activeFilter === 'comprehensive'
            return completedMainCourses;
        }
    }, [activeFilter, completedMainCourses, completedSubCourses]);

    // Effect to fetch thumbnails for displayed courses
    useEffect(() => {
        const fetchThumbnails = async () => {
            const newThumbnails = {};
            const promises = coursesToDisplay.map(async (item) => {
                // Only fetch if we don't already have the URL or if it was null
                // 'item' here is { course: ..., certificateId: ... }
                if (item.course && !certificateThumbnails[item.course.id]) {
                    try {
                        const url = await getFileStreamUrl(item.course.id, 'image');
                        newThumbnails[item.course.id] = url;
                    } catch (err) {
                        console.error(`Failed to fetch thumbnail for course ID ${item.course.id}:`, err);
                        // Optionally set a placeholder or null if fetching fails
                        newThumbnails[item.course.id] = null;
                    }
                }
            });
            await Promise.all(promises);
            // Update state, merging new thumbnails with existing ones
            setCertificateThumbnails(prevThumbnails => ({ ...prevThumbnails, ...newThumbnails }));
        };

        // Only run if there are courses to display, not currently loading, and user data is loaded
        if (coursesToDisplay.length > 0 && !isLoading && userLoaded) {
            fetchThumbnails();
        }
    }, [coursesToDisplay, isLoading, userLoaded]); // Added userLoaded to dependencies

    // --- Loading, Error, and Initial Empty States ---
    if (isLoading || !userLoaded) { // Wait for both courses from context and user data from localStorage to load
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center text-xl font-medium text-gray-700">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading your completion certificates...
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
                    Your Completion Certificates
                </h1>
                <p className="text-gray-600 text-lg">Please log in to view your completion certificates.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-3 lg:mb-5">
                Your Completion Certificates
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

            {/* Conditional message for no certificates */}
            {coursesToDisplay.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600">
                        {activeFilter === 'specialized'
                            ? "You haven't earned any Specialized Course certificates yet."
                            : "You haven't earned any Comprehensive Program certificates yet."}
                    </p>
                    <p className="text-md text-gray-500 mt-2">
                        Keep learning and complete your courses to earn certificates!
                    </p>
                </div>
            ) : (
                /* Display Completion Certificates */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    {coursesToDisplay.map(item => (
                        <CertificateCard
                            key={item.certificateId} // Use certificate ID as key
                            certificateId={item.certificateId}
                            // Pass the fetched thumbnail URL to CertificateCard
                            courseImage={certificateThumbnails[item.course.id]}
                            courseTitle={item.course.title}
                            courseDuration={formatDuration(item.course.duration)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CompletionCertificates;
