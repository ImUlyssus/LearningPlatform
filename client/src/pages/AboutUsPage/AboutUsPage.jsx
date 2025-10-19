import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom for navigation
import AboutUsBanner from '../../assets/aboutus-banner.jpeg';
import { SUPPORT_EMAIL, PHONE, WEBSITE_NAME } from '../../constants';
import OurStory from '../../assets/our-story.png'
import OurTarget from '../../assets/our-target.png';
import OurTargetMd from '../../assets/our-target-md.png';
import Founder from '../../assets/founder.png';
import {Phone, Mail, MapPin} from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Hero Section */}
            <section
                className="relative bg-cover bg-center py-20 md:py-32 overflow-hidden"
                style={{ backgroundImage: `url(${AboutUsBanner})` }}
            >
                {/* Overlay for text readability */}
                <div className="absolute inset-0 bg-[#D1F2EE] opacity-10 z-0"></div>
                <div className="container mx-auto px-6 text-center text-white z-10 relative">
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold mb-4 leading-tight text-gray-900">
                        About Our E-learning Platform
                    </h1>
                    <p className="text-md md:text-xl max-w-3xl mx-auto opacity-90 text-gray-800">
                        Discover the story behind our journey, the principles that guide us,
                        and how we're dedicated to empowering your learning and growth.
                    </p>
                </div>
                {/* Placeholder for the laptop image with content */}
                <div className="absolute inset-x-0 bottom-0 z-0">
                    <div className="w-full max-w-5xl mx-auto relative -mb-16 md:-mb-24 lg:-mb-32">
                        {/* Laptop shell placeholder */}
                        <div className="bg-gray-800 h-16 rounded-t-xl mx-auto w-11/12 md:w-5/6 relative z-0"></div>
                        <div className="bg-gray-700 h-8 rounded-b-xl mx-auto w-4/5 md:w-3/4 absolute bottom-0 inset-x-0 z-0"></div>
                        {/* Screen content placeholder */}
                        <div className="absolute top-0 inset-x-0 w-full h-full p-2 md:p-4 z-10">
                            <img
                                src={AboutUsBanner}
                                alt="Learning Experience"
                                className="w-full h-full object-cover rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer to account for the overlapping laptop */}
            {/* <div className="h-24 md:h-32 lg:h-40 bg-white"></div> */}

            {/* Reach Out Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10">
                        Reach out to us today
                    </h2>
                    <p className="text-lg text-gray-600 mb-12">
                        Whether you need support or want to learn more, we're here to assist you.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                            <div className="text-blue-600 mb-4">
                                <Mail />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Email</h3>
                            <p className="text-gray-600">{SUPPORT_EMAIL}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                            <div className="text-blue-600 mb-4">
                                <Phone />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Phone</h3>
                            <p className="text-gray-600">{PHONE}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                            <div className="text-blue-600 mb-4">
                                <MapPin />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Address</h3>
                            <p className="text-gray-600">Dagon Township, Yangon, 11011, Myanmar</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story / Our Target Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 space-y-12">
                    {/* Our Story - Text on Left, Image on Right */}
                    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="lg:grid lg:grid-cols-2">
                            <div className="lg:hidden lg:order-last">
                                <img
                                    src={OurStory}
                                    alt="Our Story"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                            {/* Text Content */}
                            <div className="p-4 md:p-8 flex items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Our Story</h3>
                                    <p className="text-xs md:text-base text-gray-300 leading-relaxed mb-4 text-justify">
                                        In an online learning landscape largely dominated by English-only platforms, our journey
                                        began with a clear mission: to embrace linguistic and cultural diversity in education.
                                        We saw a global community of learners eager for knowledge but often limited by language
                                        barriers. Driven by our vision to become the leading native-led online learning platform,
                                        we started collaborating directly with esteemed university lecturers and seasoned professionals
                                        from various non-English speaking countries. This unique approach ensures we deliver high-quality,
                                        relevant courses in learners' native languages, fostering genuine understanding and making
                                        education truly accessible and inclusive for diverse groups around the world.
                                    </p>
                                </div>
                            </div>
                            {/* Image Content */}
                            <div className="hidden lg:block lg:order-last">
                                <img
                                    src={OurStory}
                                    alt="Our Story"
                                    className="w-full h-100 object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Our Target - Image on Left, Text on Right */}
                    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div className="lg:grid lg:grid-cols-2">
        {/* Image Content */}
        <div className="lg:order-first"> {/* Ensures image is on the left on large screens and up */}
            {/* Image for small/medium devices (up to md) */}
            <img
                src={OurTargetMd}
                alt="Our Target for Mobile"
                className="w-full h-105 object-cover lg:hidden" // Visible up to md, hidden on lg and up
            />
            {/* Image for large devices (lg and up) */}
            <img
                src={OurTarget}
                alt="Our Target for Desktop"
                className="w-full h-105 object-cover hidden lg:block" // Hidden up to md, visible on lg and up
            />
        </div>
        {/* Text Content */}
        <div className="p-4 md:p-8 flex items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Target</h3>
                <p className="text-xs md:text-base text-gray-300 leading-relaxed mb-4 text-justify">
                    Our platform is designed for ambitious individuals ready to advance
                    their careers, specifically targeting career changers looking to pivot into tech
                    and professionals aiming to upskill. We solve common challenges by providing flexible
                    learning paths that seamlessly fit busy schedules and offer a significantly more
                    affordable alternative, often 5x cheaper than traditional options. Our promise is
                    to equip you with job-ready skills, industry-recognized certifications, and the
                    confidence to unlock new career opportunities. By learning from expert native lecturers
                    in your mother tongue, we aim to foster a growth mindset, inspire a new generation of
                    innovators and problem-solvers, and ensure education is affordable and accessible to all.
                </p>
            </div>
        </div>
    </div>
</div>

                </div>
            </section>


            {/* Our Proven Success Stories */}
            <section className="py-16 bg-[#D1F2EE]  text-gray-900 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl md:text-4xl font-bold mb-10">Our proven success stories</h2>
                    <div className="grid grid-cols-3 gap-8"> {/* Changed this line */}
                        <div>
                            <p className="text-2xl md:text-5xl font-extrabold mb-2">300+</p>
                            <p className="text-md md:text-lg opacity-90">Active Learners</p>
                        </div>
                        <div>
                            <p className="text-2xl md:text-5xl font-extrabold mb-2">1000+</p>
                            <p className="text-md md:text-lg opacity-90">Course Enrollments</p>
                        </div>
                        <div>
                            <p className="text-2xl md:text-5xl font-extrabold mb-2">98%</p>
                            <p className="text-md md:text-lg opacity-90">Positive Reviews</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Meet Our Founder */}
            <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Meet Our Founder
        </h2>
        <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Discover the visionary leader whose passion for education and innovation shaped our platform,
            dedicated to empowering your learning journey and helping you achieve your goals.
        </p>
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden text-start">
            {/* This outer div acts as a grid on large screens, but simply stacks its children on smaller screens */}
            <div className="lg:grid lg:grid-cols-5">

                {/* Large Image - Visible only on large screens */}
                <div className="hidden lg:block lg:order-first lg:col-span-2">
                    <img
                        src={Founder}
                        alt="Our Founder"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Content Area - This div adapts its internal layout */}
                <div className="lg:col-span-3 p-3 md:p-8 flex flex-col justify-center">

                    {/* Small Inline Image + Name/Title/Degree - Visible only on medium and smaller screens */}
                    <div className="flex items-center mb-3 md:mb-6 lg:hidden">
                        <img
                            src={Founder}
                            alt="Our Founder"
                            className="w-24 h-24 object-cover rounded-lg mr-4 flex-shrink-0"
                        />
                        <div>
                            <h3 className="text-xl md:text-3xl font-bold text-white mb-1">
                                Kyaw Swar Hein
                            </h3>
                            <p className="text-blue-400 text-md md:text-lg mb-1">
                                Founder & CEO
                            </p>
                            <p className="text-gray-400 text-sm md:text-md">
                                BSc in Computer Science, KMUTT
                            </p>
                        </div>
                    </div>

                    {/* Name/Title/Degree (without small image) - Visible only on large screens */}
                    <div className="hidden lg:block">
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-2">
                            Kyaw Swar Hein
                        </h3>
                        <p className="text-blue-400 text-md md:text-lg mb-2">
                            Founder & CEO
                        </p>
                        <p className="text-gray-400 text-sm md:text-md mb-6">
                            BSc in Computer Science, KMUTT
                        </p>
                    </div>

                    {/* --- Main body text, quote, and links (these remain consistent across all screen sizes) --- */}
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4 text-justify">
                        Kyaw Swar Hein embarked on a mission to democratize quality education after personally
                        experiencing the limitations of traditional learning and the English-centric nature of most
                        online platforms. With a strong background in Computer Science from KMUTT, Kyaw Swar Hein utilized
                        his technical expertise and a deep passion for global accessibility to build {WEBSITE_NAME}.
                        His vision was to create a truly inclusive space where learners from all linguistic backgrounds
                        could access world-class knowledge, taught by native-speaking experts,
                        at an affordable price.
                    </p>

                    <blockquote className="text-sm md:text-base text-gray-200 italic border-l-4 border-blue-500 pl-4 py-2 mb-4">
                        "Education should know no boundaries, especially not language. I built this platform to ensure
                        everyone has a fair chance to learn and grow, in their own mother tongue."
                    </blockquote>

                    <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-2 md:mb-4 text-justify">
                        Under Kyaw Swar Hein's leadership, {WEBSITE_NAME} has already connected thousands of
                        learners with diverse educational content, fostering a vibrant global community and challenging
                        the status quo of online learning accessibility.
                    </p>

                    <div className="flex space-x-4 mt-0 md:mt-4">
                        <Link to="https://www.linkedin.com/in/kyaw-swar-hein/" className="text-blue-400 hover:text-blue-500 transition">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>





            {/* What Our Customers Are Saying (Testimonials) */}
            {/* <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
            What our customers are saying
          </h2>
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
              <div className="flex justify-center -mt-16 mb-6">
                <img
                  src="https://via.placeholder.com/80x80/2B4468/E0F2F7?text=User"
                  alt="Customer Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white"
                />
              </div>
              <p className="text-lg text-gray-700 italic mb-6">
                "This e-learning platform has transformed my learning journey. The comprehensive
                courses and engaging content saved me hours of research every week, and the
                interactive quizzes have given me insights I never had before."
              </p>
              <p className="font-semibold text-blue-600">Michael Carter</p>
              <p className="text-gray-500 text-sm">Dedicated Learner</p>
            </div>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-gray-600 hover:text-blue-600 ml-4">
              &lt;
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg text-gray-600 hover:text-blue-600 mr-4">
              &gt;
            </button>
          </div>
        </div>
      </section> */}

            {/* Get More Clicks, Grow Your Business (Call to Action) */}
            <section className="py-16 bg-[#D1F2EE]  text-gray-900 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-xl md:text-3xl md:text-4xl font-bold mb-4">
                        Start your learning journey today!
                    </h2>
                    <p className="text-sm md:text-lg opacity-90 max-w-3xl mx-auto mb-8">
                        Simple tools and smart insights to help you engage with knowledge and achieve your goals.
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
                    >
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
