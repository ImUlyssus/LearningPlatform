import { useState, useEffect } from 'react';
import CourseCard from '../CourseCard/CourseCard';
import FAQItem from './FAQItem';
import MissionIcon from '../../assets/mission.png';
import VisionIcon from '../../assets/vision.png';
import ValuesIcon from '../../assets/values.png';
import { useCourses } from '../../context/CourseContext'; // Import useCourses
import { useNavigate } from 'react-router-dom';
import { getFileStreamUrl } from '../../services/fileService';

const HomeSections = () => {
  // CORRECTED: Destructure nestedCourses, isLoading, isError, error from useCourses
  const { nestedCourses, isLoading, isError, error } = useCourses();
  const [courseThumbnails, setCourseThumbnails] = useState({});

  // Access topThreeSubCourses from nestedCourses (if available)
  const topThreeSubCourses = nestedCourses?.topThreeSubCourses || [];

  const navigate = useNavigate();
  useEffect(() => {
    const fetchThumbnails = async () => {
      const newThumbnails = {};
      const promises = topThreeSubCourses.map(async (item) => {
        // Only fetch if we don't already have the URL or if it was null
        if (!courseThumbnails[item.id]) {
          const url = await getFileStreamUrl(item.id, 'image');
          newThumbnails[item.id] = url;
        }
      });
      await Promise.all(promises);
      // Update state, merging new thumbnails with existing ones
      setCourseThumbnails(prevThumbnails => ({ ...prevThumbnails, ...newThumbnails }));
    };

    // Only run if there are courses to display and not currently loading
    if (topThreeSubCourses.length > 0 && !isLoading) {
      fetchThumbnails();
    }
  }, [topThreeSubCourses, isLoading]);

  // Helper functions (moved here for direct use with topThreeSubCourses)
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
  // Inside your HomeSections component function, before the return statement:
  const [idx, setIdx] = useState(0);
  // Ensure carousel navigates within the bounds of actual top courses
  const prev = () => setIdx((i) => (i === 0 ? coursesForCarousel.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === coursesForCarousel.length - 1 ? 0 : i + 1));
  const handleExploreAllCourses = () => {
    navigate('/our-courses');
  }


  // Use topThreeSubCourses for the carousel
  const coursesForCarousel = topThreeSubCourses; // Already handled null/undefined above

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "Enrolling in a course is easy! Simply browse our course catalog, select the course you're interested in, and click the 'Enroll' button. You'll be guided through a quick registration and payment process."
    },
    {
      question: "Can I access courses on mobile devices?",
      answer: "Yes, absolutely! Our platform is fully responsive and optimized for mobile viewing. You can access all course materials, videos, and quizzes from your smartphone or tablet, anytime, anywhere."
    },
    {
    question: "What is your refund policy?",
    answer: (
      <>
        Our refund policy depends on the type of purchase:
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>
            <strong>For per course subscriptions:</strong> You can request a full refund within 12 hours of the payment date.
          </li>
          <li>
            <strong>For one-year memberships:</strong> You can request a refund within 5 days of the payment date. However, if you have accessed and completed any courses or earned any certificates during this 5-day period, the standard fee for those completed courses/certificates will be deducted from your refund amount.
          </li>
        </ul>
        All refund requests should be submitted to our support email. Please refer to our full Terms of Service for complete details.
      </>
    )
  },
    {
      question: "Are there any free courses available?",
      answer: "Although we do not have free courses currently, we occasionally offer multiple scholarship opportunities. Keep an eye on our Facebook and LinkedIn to stay updated on new scholarship announcements."
    },
    {
      question: "How long do I have access to a purchased course?",
      answer: "Once you purchase a course, you'll have lifetime access to its content. This means you can revisit the materials whenever you need a refresher, even after completing the course."
    },
    {
      question: "Will I get a certificate after completing a course?",
      answer: "Yes, upon successful completion of our courses, you will receive a verifiable certificate of completion. This certificate can be shared on your resume, CV, LinkedIn profile or other social medias."
    },
    {
      question: "Can I learn at my own pace?",
      answer: "Our courses are designed for self-paced learning. You can start, pause, and resume your learning journey whenever it suits your schedule, allowing you to balance education with your other commitments."
    },
  ];

  // Render loading state for top courses section
  if (isLoading) {
    return (
      <>
        <div className="bg-[#F0FAF9] py-8 md:py-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 bg-[#D1F2EE] rounded-lg">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800mb-4 mb-4">Our Top Courses</h2>
              <p className="text-lg text-gray-600">
                Discover the courses everyone's talking about — and start learning today!
              </p>
            </div>
            <div className="flex items-center justify-center py-6">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-medium text-gray-700">Loading top courses...</span>
            </div>
          </section>
          {/* Render other sections below if they don't depend on top courses */}
          {/* Our Mission, Vision & Values – 3 stacked rows */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-xl md:text-4xl font-extrabold text-gray-800">
                Our Mission, Vision & Values
              </h2>
            </div>
            <div className="max-w-5xl mx-auto bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden divide-y divide-gray-200">
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={MissionIcon} alt="Mission icon" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">MISSION</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    To empower learners worldwide by connecting them with expert native lecturers,
                    delivering high-quality courses in their own languages.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={VisionIcon} alt="Vision icon" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VISION</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    To become the leading native-led online learning platform that embraces innovation,
                    adapts to change, and makes education accessible to all without language barriers.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={ValuesIcon} alt="Values icon" className="h-10 w-10 object-contain rotate-45" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VALUES</h3>
                  <ul className="text-gray-600 text-sm sm:text-base leading-relaxed list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <li><strong className="text-gray-800">Sustainability</strong> – Building a platform that supports long-term social and educational impact.</li>
                    <li><strong className="text-gray-800">Collaboration</strong> – Working with educators, partners, and learners to co-create value.</li>
                    <li><strong className="text-gray-800">Inclusivity</strong> – Respect and embrace cultural and linguistic diversity.</li>
                    <li><strong className="text-gray-800">Adaptability</strong> – Resilience to change and ability to thrive in evolving environments.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="bg-[#F1F2F1] py-8 md:py-16">
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl md:text-4xl font-extrabold text-gray-800 mb-4">Frequently Asked Questions</h2>
            </div>
            <div>
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  // Render error state for top courses section
  if (isError) {
    return (
      <>
        <div className="bg-[#F0FAF9] py-8 md:py-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800mb-4 mb-4">Our Top Courses</h2>
              <p className="text-lg text-gray-600">
                Discover the courses everyone's talking about — and start learning today!
              </p>
            </div>
            <div className="p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
              <p className="mb-2">Error: {error ? error.message : 'An unknown error occurred while fetching top courses.'}</p>
            </div>
          </section>
          {/* Render other sections below */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
                Our Mission, Vision & Values
              </h2>
            </div>
            <div className="max-w-5xl mx-auto bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden divide-y divide-gray-200">
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={MissionIcon} alt="Mission icon" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">MISSION</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    To empower learners worldwide by connecting them with expert native lecturers,
                    delivering high-quality courses in their own languages.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={VisionIcon} alt="Vision icon" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VISION</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    To become the leading native-led online learning platform that embraces innovation,
                    adapts to change, and makes education accessible to all without language barriers.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
                <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                  <img src={ValuesIcon} alt="Values icon" className="h-10 w-10 object-contain rotate-45" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VALUES</h3>
                  <ul className="text-gray-600 text-sm sm:text-base leading-relaxed list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <li><strong className="text-gray-800">Sustainability</strong> – Building a platform that supports long-term social and educational impact.</li>
                    <li><strong className="text-gray-800">Collaboration</strong> – Working with educators, partners, and learners to co-create value.</li>
                    <li><strong className="text-gray-800">Inclusivity</strong> – Respect and embrace cultural and linguistic diversity.</li>
                    <li><strong className="text-gray-800">Adaptability</strong> – Resilience to change and ability to thrive in evolving environments.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="bg-[#F1F2F1] py-8 md:py-16">
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl md:text-4xl font-extrabold text-gray-800 mb-4">Frequently Asked Questions</h2>
            </div>
            <div>
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }


  return (
    <>
      <div className="bg-[#F0FAF9] py-8 md:py-13 md:px-2">
        {/* Our Top Courses Section */}
        <section className="max-w-7xl mx-auto py-6 px-2 md:px-2 lg:px-8 mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-4xl font-extrabold text-gray-800mb-4 mb-4">Our Top Courses</h2>
            <p className="text-lg text-gray-600">
              Discover the courses everyone's talking about — and start learning today!
            </p>
          </div>

          {coursesForCarousel.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-lg text-gray-600">No top courses available at the moment.</p>
              <p className="text-md text-gray-500 mt-2">Check back later or explore our <a href="/our-courses" className="text-blue-600 hover:underline">full catalog</a>!</p>
            </div>
          ) : (
            <>
              {/* Small screens: single-card carousel */}
              <div className="md:hidden"> {/* This div is hidden on md and larger */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={prev}
                    aria-label="Previous course"
                    // Disable button if only one course is present
                    disabled={coursesForCarousel.length <= 1}
                    className="p-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="w-full max-w-sm">
                    <CourseCard
                    id={coursesForCarousel[idx].id}
                    // --- UPDATE THIS LINE ---
                    image={courseThumbnails[coursesForCarousel[idx].id]} // Use the fetched thumbnail from state
                    // --- END UPDATE ---
                    title={coursesForCarousel[idx].title}
                    duration={formatDuration(coursesForCarousel[idx].duration)}
                    description={coursesForCarousel[idx].overview}
                    price={formatCost(coursesForCarousel[idx].cost)}
                  />
                  </div>

                  <button
                    onClick={next}
                    aria-label="Next course"
                    // Disable button if only one course is present
                    disabled={coursesForCarousel.length <= 1}
                    className="p-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="mt-3 flex justify-center gap-2">
                  {coursesForCarousel.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              {/* md and lg screens: 3 in a row */}
              {/* The 'hidden' is removed, and grid-cols-3 is applied from 'md' breakpoint */}
              <div className="hidden md:grid grid-cols-3 gap-2 lg:gap-8">
                {coursesForCarousel.map((item) => (
                  <CourseCard
                    key={item.id}
                    id={item.id}
                    // --- UPDATE THIS LINE ---
                    image={courseThumbnails[item.id]} // Use the fetched thumbnail from state
                    // --- END UPDATE ---
                    title={item.title}
                    duration={formatDuration(item.duration)}
                    description={item.overview}
                    price={formatCost(item.cost)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="text-center mt-12">
            <button
              onClick={handleExploreAllCourses}
              className="inline-flex items-center px-6 py-3 border border-blue-500 text-blue-500 font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300">
              Explore All Courses
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>
        </section>

        {/* Our Mission, Vision & Values – 3 stacked rows */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
              Our Mission, Vision & Values
            </h2>
          </div>

          {/* Full-width stacked cards with dividers */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm overflow-hidden divide-y divide-gray-200">
            {/* Mission row */}
            <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
              <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                <img src={MissionIcon} alt="Mission icon" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">MISSION</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  To empower learners worldwide by connecting them with expert native lecturers,
                  delivering high-quality courses in their own languages.
                </p>
              </div>
            </div>

            {/* Vision row */}
            <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
              <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                <img src={VisionIcon} alt="Vision icon" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VISION</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  To become the leading native-led online learning platform that embraces innovation,
                  adapts to change, and makes education accessible to all without language barriers.
                </p>
              </div>
            </div>

            {/* Values row */}
            <div className="p-6 sm:p-8 md:grid md:grid-cols-[72px_1fr] md:gap-6 items-start">
              <div className="mx-auto md:mx-0 mb-4 md:mb-0 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                <img src={ValuesIcon} alt="Values icon" className="h-10 w-10 object-contain rotate-45" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">VALUES</h3>
                <ul className="text-gray-600 text-sm sm:text-base leading-relaxed list-disc pl-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <li><strong className="text-gray-800">Sustainability</strong> – Building a platform that supports long-term social and educational impact.</li>
                  <li><strong className="text-800">Collaboration</strong> – Working with educators, partners, and learners to co-create value.</li>
                  <li><strong className="text-gray-800">Inclusivity</strong> – Respect and embrace cultural and linguistic diversity.</li>
                  <li><strong className="text-gray-800">Adaptability</strong> – Resilience to change and ability to thrive in evolving environments.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="bg-[#F1F2F1] py-8 md:py-16">
        {/* Frequently Asked Questions Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl md:text-4xl font-extrabold text-gray-800 mb-4">Frequently Asked Questions</h2>
          </div>
          <div>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeSections;
