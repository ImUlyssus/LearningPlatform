import React, { useState, useEffect, useCallback } from 'react';
import BannerImage from '../../assets/banner-image.png';
import { X, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Chevron icons

// Helper function to flatten the course structure for easy lookup
const flattenCourses = (nestedCourses) => {
  const courseMap = new Map();

  if (!nestedCourses) return courseMap;

  // Add main courses
  nestedCourses.mainCourses?.forEach(mainCourse => {
    courseMap.set(mainCourse.id, mainCourse.title);
    // Add their sub-courses
    mainCourse.subCourses?.forEach(subCourse => {
      courseMap.set(subCourse.id, subCourse.title);
    });
  });

  // Add independent sub-courses
  nestedCourses.independentSubCourses?.forEach(independentSubCourse => {
    courseMap.set(independentSubCourse.id, independentSubCourse.title);
  });

  return courseMap;
};

const Banner = ({ activePromotions, allCourses }) => {
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0); // New state for index
  const [courseTitleMap, setCourseTitleMap] = useState(new Map());

  // Effect to flatten courses when allCourses prop changes
  useEffect(() => {
    setCourseTitleMap(flattenCourses(allCourses));
  }, [allCourses]);

  // Effect to manage promotion display and cycling
  useEffect(() => {
    let intervalId;
    if (activePromotions && activePromotions.length > 0) {
      setShowPromotionDialog(true);

      // Start cycling if there's more than one promotion
      if (activePromotions.length > 1) {
        intervalId = setInterval(() => {
          setCurrentPromotionIndex(prevIndex =>
            (prevIndex + 1) % activePromotions.length
          );
        }, 7000); // Cycle every 7 seconds (adjust as needed)
      }
    } else {
      // No active promotions, hide dialog
      setShowPromotionDialog(false);
      setCurrentPromotionIndex(0); // Reset index
    }

    return () => { // Cleanup function
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activePromotions]); // Only depend on activePromotions array

  // Derive currentPromotion from currentPromotionIndex
  const currentPromotion = activePromotions && activePromotions.length > 0
    ? activePromotions[currentPromotionIndex]
    : null;

  // Function to get course titles from an array of IDs
  const getCourseTitlesFromIds = useCallback((idString) => {
    try {
      const ids = JSON.parse(idString); // Parse the JSON string of IDs
      if (!Array.isArray(ids)) return []; // Ensure it's an array

      const titles = ids.map(id => courseTitleMap.get(id)).filter(Boolean); // Get titles and filter out undefined
      return titles;
    } catch (e) {
      console.error("Failed to parse course_id string:", e);
      return [];
    }
  }, [courseTitleMap]);

  // Handle manual navigation
  const goToNextPromotion = useCallback(() => {
    if (activePromotions && activePromotions.length > 0) {
      setCurrentPromotionIndex(prevIndex => (prevIndex + 1) % activePromotions.length);
    }
  }, [activePromotions]);

  const goToPreviousPromotion = useCallback(() => {
    if (activePromotions && activePromotions.length > 0) {
      setCurrentPromotionIndex(prevIndex =>
        (prevIndex - 1 + activePromotions.length) % activePromotions.length
      );
    }
  }, [activePromotions]);


  // If no currentPromotion, render just the banner content
  if (!currentPromotion) {
    return (
      <section className="relative overflow-hidden bg-white">
        {/* Background gradient for the main banner */}
        <div className="absolute inset-0 banner-background-gradient opacity-80 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6 sm:mb-8">
                Master <span className="text-orange-500">New Skills</span> Anytime, Anywhere!
              </h1>
              <p className="text-sm sm:text-base md:text-md text-gray-700 mb-8 sm:mb-10 max-w-xl mx-auto md:mx-0">
                Join a thriving community of learners and achieve your goals through our expert-led online courses. Learn when it suits you and build valuable skills for lasting career growth.
              </p>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto md:mx-0">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">10+</div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">300+</div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">300+</div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">Scholarships</div>
                </div>
              </div>
            </div>
            {/* Right Image */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <img
                src={BannerImage}
                alt="Happy learner"
                className="w-4/5 sm:w-3/4 md:w-full max-w-[520px] h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Determine dialog content and style based on promotion type
  const isAllCoursesPromotion = currentPromotion.course_id === 'ALL_COURSES';
  const promotionTitle = currentPromotion.title;
  const promotionDescription = currentPromotion.description;
  const promotionAmount = currentPromotion.promotion_amount;

  const dialogContent = isAllCoursesPromotion ? (
    <>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{promotionTitle}</h3>
      <p className="text-white text-base md:text-lg mb-4">
        We are thrilled to announce a special promotion: Get a <strong>{promotionAmount}%</strong> discount on all our courses!
      </p>
      {/* {promotionDescription && (
        <p className="text-white text-sm md:text-base italic">{promotionDescription}</p>
      )} */}
      <p className="text-white text-sm md:text-base mt-2">
        Don't miss out on this limited-time offer to learn new skills!
      </p>
    </>
  ) : (
    <>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{promotionTitle}</h3>
      <p className="text-white text-base md:text-lg mb-2">
        Unlock a <strong>{promotionAmount}%</strong> discount on these exciting courses:
      </p>
      <ul className="list-disc list-inside text-white text-sm md:text-base mb-4 space-y-1">
        {getCourseTitlesFromIds(currentPromotion.course_id).map((title, index) => (
          <li key={index}>{title}</li>
        ))}
      </ul>
      {/* {promotionDescription && (
        <p className="text-white text-sm md:text-base italic">{promotionDescription}</p>
      )} */}
      <p className="text-white text-sm md:text-base mt-2">
        Enroll now and start your learning journey!
      </p>
    </>
  );

  // Choose gradient based on promotion type (can customize more)
  const dialogGradientClass = isAllCoursesPromotion
    ? 'gradient-green-teal-blue' // Vibrant blue-green
    : 'gradient-purple-pink-red'; // Thrilling pink-purple-red

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient for the main banner */}
      <div className="absolute inset-0 banner-background-gradient opacity-80 pointer-events-none" />

      {/* Promotion Dialog Container */}
      {showPromotionDialog && currentPromotion && ( // Ensure currentPromotion exists before rendering
        <div
          className={`fixed z-50 w-[90%] sm:w-3/4 md:w-1/3 rounded-lg shadow-lg
                      transform transition-all duration-500 ease-in-out
                      ${dialogGradientClass} text-white
                      ${showPromotionDialog ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
                      top-22 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0`}
        >
          <button
            onClick={() => setShowPromotionDialog(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close promotion"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons for multiple promotions */}
          {activePromotions.length > 1 && (
            <>
              <button
                onClick={goToPreviousPromotion}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 focus:outline-none p-1 rounded-full bg-white hover:bg-gray-200 z-10"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNextPromotion}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 focus:outline-none p-1 rounded-full bg-white hover:bg-gray-200 z-10"
                aria-label="Next promotion"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content wrapper with conditional padding for navigation buttons */}
          <div className={`p-4 md:p-6 ${activePromotions.length > 1 ? 'px-12 md:px-16' : ''}`}>
            {dialogContent}
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-3xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6 sm:mb-8">
              Master <span className="text-orange-500">New Skills</span> Anytime, Anywhere!
            </h1>

            <p className="text-sm sm:text-base md:text-md text-gray-700 mb-8 sm:mb-10 max-w-xl mx-auto md:mx-0">
              Join a thriving community of learners and achieve your goals through our expert-led online courses. Learn when it suits you and build valuable skills for lasting career growth.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto md:mx-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">10+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">300+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Learners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">300+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Scholarships</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src={BannerImage}
              alt="Happy learner"
              className="w-4/5 sm:w-3/4 md:w-full max-w-[520px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
