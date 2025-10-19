import React from 'react';
import {
  GOOGLE_FORM_PER_COURSE,
  GOOGLE_FORM_ANNUAL_SUBSCRIPTION,
  GOOGLE_FORM_MONTHLY_PROMOTION,
  GOOGLE_FORM_BUDDY_PROMOTION
} from '../../constants';
const PricingPromotionsPage = () => {
  // IMPORTANT: Replace these with your actual Google Form links!
  const googleFormLinks = {
    perCourse: GOOGLE_FORM_PER_COURSE,
    annualSubscription: GOOGLE_FORM_ANNUAL_SUBSCRIPTION,
    monthlyPromotion: GOOGLE_FORM_MONTHLY_PROMOTION,
    buddyPromotion: GOOGLE_FORM_BUDDY_PROMOTION,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl lg:text-6xl">
            Flexible Learning, Great Savings!
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the best way to learn and discover our exciting promotions designed to help you achieve your goals.
          </p>
        </div>

        {/* Pricing Options Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 md:text-4xl">
            Our Pricing Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Per-Course Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="text-center flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Per-Course Pricing</h3>
                <p className="text-3xl lg:text-5xl font-extrabold text-blue-600 mb-6">
                  MMK 45,000<span className="text-xl font-medium text-gray-500">/course</span>
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Pay as you learn, perfect for focused skill development. Each specialized course is charged individually.
                </p>
              </div>
              <a
                href={googleFormLinks.perCourse}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 mt-auto text-center" // Added text-center here
              >
                Enroll Now
              </a>
            </div>

            {/* Annual Subscription Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 border-2 border-blue-500 flex flex-col">
              <div className="text-center flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Annual Subscription</h3>
                <p className="text-3xl lg:text-5xl font-extrabold text-blue-600 mb-6">
                  MMK 450,000<span className="text-xl font-medium text-gray-500">/year</span>
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Unlock unlimited learning! Get full access to all specialized courses and comprehensive programs.
                </p>
              </div>
              <a
                href={googleFormLinks.annualSubscription}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 mt-auto text-center" // Added text-center here
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </section>

        {/* Promotion Options Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 md:text-4xl">
            Exciting Promotions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Monthly Promotion Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="text-center flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Monthly Flash Sale</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Catch our special discounts at the start of every month!
                </p>
                <ul className="list-disc list-inside text-left mx-auto max-w-sm text-gray-600 mb-6">
                  <li><span className="font-semibold text-green-600">20% OFF</span> all specialized courses</li>
                  <li><span className="font-semibold text-green-600">25% OFF</span> all comprehensive programs</li>
                </ul>
                <p className="text-sm text-gray-500 mb-8">
                  Available only during the first 5 days of every month!
                </p>
              </div>
              <a
                href={googleFormLinks.monthlyPromotion}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 mt-auto text-center" // Added text-center here
              >
                Grab the Deal!
              </a>
            </div>

            {/* Buddy Promotion Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="text-center flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Learn with Friends</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Study smarter, together! Gather your crew and save.
                </p>
                <p className="text-4xl font-extrabold text-green-600 mb-6">
                  10% OFF
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  When one user invites two friends, and your group collectively purchases 3 or more courses.
                </p>
              </div>
              <a
                href={googleFormLinks.buddyPromotion}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 mt-auto text-center" // Added text-center here
              >
                Team Up & Save!
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPromotionsPage;
