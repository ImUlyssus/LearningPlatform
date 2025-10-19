import React from 'react';
import OnlineLearning from '../../assets/online-learning.png';
import OnlineLearningMD from '../../assets/online-learning_md.png';
import { WEBSITE_NAME } from '../../constants'; // Import the website name constant
const HomeBody = () => {
  return (
    <main className="bg-white pt-6 lg:pt-8 px-8">
      {/* Why? Section */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-16 mb-8 md:mb-12 lg-20">
        <div className="md:w-5/12 w-full flex justify-center">
          {/* OnlineLearningMD: Hidden by default, visible only on medium screens, hidden again on large screens */}
          <img
            src={OnlineLearningMD}
            alt="Online Learning"
            className="hidden lg:hidden md:block rounded-xl shadow-xl object-cover"
          />

          {/* OnlineLearning: Visible by default (small screens), hidden on medium screens, visible again on large screens */}
          <img
            src={OnlineLearning}
            alt="Online Learning"
            className="lg:block md:hidden rounded-xl shadow-xl object-cover"
          />
        </div>

        <div className="md:w-7/12 w-full md:text-left">
          <h2 className="text-xl md:text-3xl lg:text-4xl text-center font-bold text-gray-900 my-5 md:my-5 lg:my-10">
            Why {WEBSITE_NAME}?
          </h2>
          <ul className="list-none space-y-4 text-md lg:text-lg text-gray-700">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Learn from experts with courses priced up to 5× more affordable than traditional options.
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Quality over quantity — every course is carefully designed for real skill development.
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Share your success with instant certificate links upon course completion.
            </li>
          </ul>
          {/* Why online learning? Section */}
          <section className="max-w-4xl mx-auto mt-10">
            <h2 className="text-xl md:text-3xl lg:text-4xl text-center font-bold text-gray-900 my-5 lg:my-10">
              Why online learning?
            </h2>
            <p className="text-md lg:text-lg text-gray-700 leading-relaxed">
              Online learning gives you the flexibility to study anytime, anywhere, fitting education into your life instead of the other way around. Whether you're at home, traveling, or on a break, you can access lessons on your schedule and move at your own pace.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default HomeBody;
