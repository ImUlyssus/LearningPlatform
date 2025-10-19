// src/pages/LectureViewer/LectureViewer.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'; // ADD useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { getFileStreamUrl } from '../../services/fileService';
import { LECTURE_ERROR_EMAIL } from '../../constants';
import { getQuizByLectureId } from '../../services/quizService'; // Assuming quizService.js is in src/services
import QuizComponent from '../../components/QuizComponent/QuizComponent';
import ErrorBoundary from './ErrorBoundary';
// This is the stable fix for the worker. DO NOT CHANGE.
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
const pdfViewerVersion = '3.12.0'; // Remove this line in the future
const workerUrl = `/pdf-assets/pdf.worker.js?v=${pdfViewerVersion}`;



const LectureViewer = () => {
    const { subCourseId, lectureId } = useParams();
    const navigate = useNavigate();
    const { nestedCourses, isLoading, isError, error } = useCourses();
    const [videoSourceUrl, setVideoSourceUrl] = useState(null);
    const [pdfSourceUrl, setPdfSourceUrl] = useState(null);
    const [isMediaUrlLoading, setIsMediaUrlLoading] = useState(true);

    const [currentSubCourse, setCurrentSubCourse] = useState(null);
    const [currentModule, setCurrentModule] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [zipSourceUrl, setZipSourceUrl] = useState(null);
    const [allLecturesInOrder, setAllLecturesInOrder] = useState([]);

    const [hasMediaLoadError, setHasMediaLoadError] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [numPages, setNumPages] = useState(null);
    const pdfContainerRef = useRef(null);
    const [pdfContainerWidth, setPdfContainerWidth] = useState(null);

    const [quizData, setQuizData] = useState(null);
    const [userQuizzesInfo, setUserQuizzesInfo] = useState(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    // *** PERFORMANCE FIX: Memoize the options object ***
    // This prevents the warning and unnecessary re-renders of the Document component.
    // const pdfOptions = useMemo(() => ({
    //     cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    //     cMapPacked: true,
    // }), []);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        setHasMediaLoadError(false);
        setIsSidebarOpen(false);
        setNumPages(null);
        setPdfContainerWidth(null);
        setVideoSourceUrl(null);
        setPdfSourceUrl(null);
        setZipSourceUrl(null);
        setIsMediaUrlLoading(true);
    }, [lectureId]);

    useEffect(() => {
        const updateWidth = () => {
            if (pdfContainerRef.current) {
                const currentWidth = pdfContainerRef.current.offsetWidth;
                // Only update if the width is valid (not 0) and different from current state
                // We add 1 to pdfContainerWidth for comparison because we subtract 1 when setting
                if (currentWidth > 0 && currentWidth !== (pdfContainerWidth ? pdfContainerWidth + 1 : 0)) {
                    setPdfContainerWidth(currentWidth - 1);
                }
            }
        };

        // Call updateWidth when currentLecture or isSidebarOpen changes,
        // AND specifically when isMediaUrlLoading becomes false (meaning the content div is now mounted and ready).
        // This ensures the ref is likely to have a valid width.
        if (!isMediaUrlLoading && currentLecture && currentLecture.type === 'reading') {
            // Use requestAnimationFrame to ensure the DOM has been painted and dimensions are stable
            requestAnimationFrame(updateWidth);
        }

        // Add event listener for window resize
        window.addEventListener('resize', updateWidth);

        // Cleanup function
        return () => window.removeEventListener('resize', updateWidth);
    }, [currentLecture, isMediaUrlLoading, pdfContainerWidth]);

    const getLectureIcon = (type) => {
        switch (type) {
            case 'reading':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" /></svg>
                );
            case 'video':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                );
            case 'quiz':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                );
        }
    };

       useEffect(() => {
        if (nestedCourses && subCourseId && lectureId) {
            let foundSubCourse = null;
            for (const mainCourse of nestedCourses.mainCourses || []) {
                foundSubCourse = (mainCourse.subCourses || []).find(sub => String(sub.id) === subCourseId);
                if (foundSubCourse) break;
            }
            if (!foundSubCourse) {
                foundSubCourse = (nestedCourses.independentSubCourses || []).find(sub => String(sub.id) === subCourseId);
            }
            if (foundSubCourse) {
                setCurrentSubCourse(foundSubCourse);
                const allLecs = [];
                let foundMod = null;
                let foundLec = null;
                foundSubCourse.modules.forEach(module => {
                    module.lectures.forEach(lecture => {
                        allLecs.push({ ...lecture, moduleId: module.id, moduleTitle: module.title });
                        if (String(lecture.id) === lectureId) {
                            foundLec = lecture;
                            foundMod = module;
                        }
                    });
                });
                setAllLecturesInOrder(allLecs);
                setCurrentLecture(foundLec);
                setCurrentModule(foundMod);

                // Reset all content-specific states on lecture change
                setVideoSourceUrl(null);
                setPdfSourceUrl(null);
                setZipSourceUrl(null);
                setQuizData(null);
                setUserQuizzesInfo(null);
                setIsMediaUrlLoading(true); // Start loading for new lecture content
                setHasMediaLoadError(false);
                setIsQuizLoading(false);
                setQuizError(null);


                // Asynchronous content fetching logic for all lecture types
                const fetchContent = async () => {
                    let mediaUrl = null; // For video or PDF
                    let contentFound = true; // Assume content will be found

                    if (foundLec.type === 'video') {
                        mediaUrl = await getFileStreamUrl(foundLec.id, 'video');
                        setVideoSourceUrl(mediaUrl);
                        if (!mediaUrl) contentFound = false;
                    } else if (foundLec.type === 'reading') {
                        mediaUrl = await getFileStreamUrl(foundLec.id, 'pdf');
                        setPdfSourceUrl(mediaUrl);
                        if (!mediaUrl) contentFound = false;
                    } else if (foundLec.type === 'quiz') { // NEW: Handle quiz type
                        setIsQuizLoading(true);
                        try {
                            const response = await getQuizByLectureId(foundLec.id); 
                            setQuizData(response.data.quiz);
                            setUserQuizzesInfo(response.data.user_quizzes_info);
                        } catch (err) {
                            console.error("Error fetching quiz data:", err);
                            setQuizError("Failed to load quiz. Please try again.");
                            contentFound = false; // Mark content as not found if quiz fails to load
                        } finally {
                            setIsQuizLoading(false);
                        }
                    }

                    // Fetch supplementary ZIP file URL regardless of main content type
                    const zipUrl = await getFileStreamUrl(foundLec.id, 'zip');
                    setZipSourceUrl(zipUrl);

                    // If main media content (video/pdf) or quiz failed to load, set error
                    if (!contentFound) {
                        setHasMediaLoadError(true);
                    }
                    setIsMediaUrlLoading(false); // All fetching for primary content is done
                };

                // Always trigger fetching if a lecture is found
                if (foundLec) {
                    fetchContent();
                } else {
                    // If no lecture found, reset all content-related states
                    setVideoSourceUrl(null);
                    setPdfSourceUrl(null);
                    setZipSourceUrl(null);
                    setQuizData(null);
                    setUserQuizzesInfo(null);
                    setIsMediaUrlLoading(false);
                    setHasMediaLoadError(false);
                }

            } else {
                setCurrentSubCourse(null);
                setCurrentLecture(null);
                setCurrentModule(null);
                // Reset all content-related states if sub-course or lecture not found
                setVideoSourceUrl(null);
                setPdfSourceUrl(null);
                setZipSourceUrl(null);
                setQuizData(null);
                setUserQuizzesInfo(null);
                setIsMediaUrlLoading(false);
                setHasMediaLoadError(false);
            }
        }
    }, [subCourseId, lectureId, nestedCourses, navigate]); // navigate added as a dependency if used inside useEffect directly


    const handleNextLecture = () => {
        const currentIndex = allLecturesInOrder.findIndex(lec => String(lec.id) === lectureId);
        if (currentIndex !== -1 && currentIndex < allLecturesInOrder.length - 1) {
            const nextLecture = allLecturesInOrder[currentIndex + 1];
            navigate(`/sub-course/${subCourseId}/lecture/${nextLecture.id}`);
        }
    };

    const handlePreviousLecture = () => {
        const currentIndex = allLecturesInOrder.findIndex(lec => String(lec.id) === lectureId);
        if (currentIndex > 0) {
            const prevLecture = allLecturesInOrder[currentIndex - 1];
            navigate(`/sub-course/${subCourseId}/lecture/${prevLecture.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="flex items-center text-xl font-medium text-gray-700"><svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading lecture...</div></div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200"><p className="mb-2">Error: {error ? error.message : 'An unknown error occurred while fetching lecture details.'}</p></div></div>
        );
    }

    if (!currentSubCourse || !currentLecture || !currentModule) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="p-8 text-center text-xl font-medium text-gray-700 bg-white rounded-lg shadow-md">Lecture or Sub-Course not found. Please check the URL.</div></div>
        );
    }

    const currentIndex = allLecturesInOrder.findIndex(lec => String(lec.id) === lectureId);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex !== -1 && currentIndex < allLecturesInOrder.length - 1;

    const mediaComponent = (() => {
        // --- NEW LOADING STATE ---
        if (isMediaUrlLoading) {
            return (
                <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold p-4 text-center">
                    <p className="mb-2">
                        Content not found! Please contact <br />
                        <a
                            href={`mailto:${LECTURE_ERROR_EMAIL}`} // This is the key change: use mailto:
                            className='text-underline text-blue-400 hover:text-blue-600 transition-colors' // Added a hover effect for better UX
                        >
                            {LECTURE_ERROR_EMAIL}
                        </a>
                    </p>
                </div>
            );
        }
        // --- END NEW LOADING STATE ---

        if (hasMediaLoadError) {
            return (
                <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold p-4 text-center"><p className="mb-2"><span className="text-red-500 mr-2 text-3xl">⚠️</span>Content not available or failed to load.</p><p className="text-sm text-gray-500">Please ensure the file exists or contact support.</p></div>
            );
        }
        if (currentLecture.type === 'video') {
            // --- USE NEW STATE VARIABLE ---
            if (!videoSourceUrl) {
                // This means getFileStreamUrl returned null, and hasMediaLoadError should have been set.
                // This block acts as a safeguard.
                return null; // Or return a specific "video not found" message
            }
            return (
                <div className="w-full max-w-4xl sm:h-base bg-black flex items-center justify-center rounded-lg overflow-hidden mt-[45%] lg:mt-0">
                    <video
                        controls
                        src={videoSourceUrl} // Use the fetched URL
                        className="w-full h-full object-contain"
                        title={currentLecture.title}
                        onError={() => setHasMediaLoadError(true)} // Keep this as a fallback for network issues after URL is obtained
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        } else if (currentLecture.type === 'reading') {
            if (!pdfSourceUrl) return null;

            // Using Option 1 (react-pdf-viewer)
            return (
                <ErrorBoundary>
                    <div className="w-full h-full">
                        <Worker workerUrl={workerUrl}>
                            <Viewer
                                fileUrl={pdfSourceUrl}
                                plugins={[defaultLayoutPluginInstance]}
                            />
                        </Worker>
                    </div>
                </ErrorBoundary>
            );
        } else if (currentLecture.type === 'quiz') {
            if (isQuizLoading) {
                return (
                    <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-gray-200 text-gray-600 text-lg font-semibold p-4 text-center">
                        <p>Loading quiz questions...</p>
                    </div>
                );
            }
            if (quizError) {
                return (
                    <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-red-100 text-red-700 text-lg font-semibold p-4 text-center">
                        <p>{quizError}</p>
                    </div>
                );
            }
            if (quizData) {
                // Pass the fetched quizData and userQuizzesInfo to the QuizComponent
                return <QuizComponent quizData={quizData} userQuizzesInfo={userQuizzesInfo} navigate={navigate} />;
            }
            // Fallback if it's a quiz type but no data, loading, or error state is active
            return <div className="text-gray-600 text-lg">No quiz content available.</div>;
        } else {
            return (<div className="text-gray-600 text-lg">Unsupported lecture type or no lecture content available.</div>);
        }
    })();


    return (
        // Main container for the entire lecture viewer layout
        <div className="flex h-[90vh] bg-gray-100 font-sans md:max-h-[85vh]">

            {/* Mobile Sidebar: Dark overlay shown when the sidebar is open on small screens */}
            {isSidebarOpen && (<div className="fixed inset-0 bg-transparent bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar}></div>)}

            {/* Left Sidebar: Contains course navigation */}
            <div className={`bg-white shadow-lg flex flex-col border-r border-gray-200 md:relative md:flex md:w-60 lg:w-80 md:translate-x-0 fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}>

                {/* Sidebar Header: Back button and sub-course title */}
                <div className="px-4 pt-20 md:pt-9 pb-4 border-b border-gray-200 flex items-center shrink-0">
                    <button onClick={() => navigate(`/sub-course/${subCourseId}`)} className="text-gray-600 hover:text-gray-900 mr-3 p-1 rounded-full hover:bg-gray-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                    <h2 className="text-lg font-semibold text-gray-800 flex-1 truncate">{currentSubCourse.title}</h2>
                </div>

                {/* Sidebar Content: Scrollable list of modules and lectures */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentSubCourse.modules.map(module => (
                        <div key={module.id}>
                            <h3 className="text-md font-bold text-gray-700 mb-2">{module.title}</h3>
                            <ul className="space-y-1">
                                {module.lectures.map(lecture => (
                                    <li key={lecture.id} className={`flex items-center p-2 rounded-md cursor-pointer ${String(lecture.id) === lectureId ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`} onClick={() => navigate(`/sub-course/${subCourseId}/lecture/${lecture.id}`)}>
                                        {getLectureIcon(lecture.type)}
                                        <span className="text-sm truncate">{lecture.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area: The right side of the screen */}
            <div className="flex-1 flex flex-col">

                {/* Main Header: Displays lecture title and mobile menu button */}
                <header className="bg-white shadow-sm px-4 pt-8 pb-4 border-b border-gray-200 flex justify-between items-center shrink-0">
    <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-600 hover:text-gray-900 mr-3 rounded-full hover:bg-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    {/*
        Removed `truncate`
        Added `break-words`
        Kept `flex-1` and `min-w-0`
        Fixed typo: `test-[10px]` to `text-[10px]` or `text-sm` (using `text-sm` as a common choice)
    */}
    <h1 className="hidden md:block text-sm md:text-xl font-bold text-gray-900 flex-1 min-w-0 break-words mr-3">{currentLecture.title}</h1>
    {zipSourceUrl && (
        <button
            onClick={() => {
                const link = document.createElement('a');
                link.href = zipSourceUrl;
                link.setAttribute('download', `${currentLecture.title}`); // Name the downloaded file as lecture title + .zip
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }}
            // `flex-shrink-0` remains important here to ensure the button doesn't shrink
            className="text-blue-500 border border-blue-300 px-4 py-2 rounded-lg text-[10px] md:text-sm hover:bg-blue-100 transition-colors flex-shrink-0"
        >
            Download Material
        </button>
)}
</header>



                {/* Lecture Content Display: Renders the video, PDF, or quiz */}
                <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center justify-start p-4">{mediaComponent}</div>
                {/* <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center items-center p-4">{mediaComponent}</div> */}

                {/* Footer Navigation: "Previous" and "Next" lecture buttons */}
                <footer className="bg-white p-4 border-t border-gray-200 flex justify-between items-center shrink-0">
                    <button onClick={handlePreviousLecture} disabled={!hasPrevious} className={`flex items-center px-6 py-2 rounded-lg text-base font-medium transition-colors ${hasPrevious ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Previous</button>
                    <button onClick={handleNextLecture} disabled={!hasNext} className={`flex items-center px-6 py-2 rounded-lg text-base font-medium transition-colors ${hasNext ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Next<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                </footer>
            </div>
        </div>
    );

};

export default LectureViewer;
