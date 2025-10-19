import React, { useState } from 'react';

const FourSteps = () => {
  const steps = [
    { number: '1.', title: 'Register', description: 'Register your interested course(s)' },
    { number: '2.', title: 'Learn', description: 'Learn the course and upgrade your skills' },
    { number: '3.', title: 'Take Quiz', description: 'Take quizzes and evaluate your learning' },
    { number: '4.', title: 'Get Certificate', description: 'Get certificates and share with others' },
  ];

  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i === 0 ? steps.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === steps.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-[#2B4468] py-4 px-4 md:px-8 text-white text-center">
      <h2 className="text-lg md:text-2xl lg:text-4xl font-bold mb-4">
        Upskill yourself with the following 4 simple steps
      </h2>

      {/* Small screens: single-card carousel */}
      <div className="md:hidden flex items-center justify-center gap-2">
        <button
          onClick={prev}
          aria-label="Previous"
          className="p-2 rounded-full bg-white/90 text-[#2B4468] hover:bg-white transition"
        >
          {/* Left chevron */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-full max-w-sm">
          <div className="bg-white p-6 rounded-lg text-left text-[#2B4468] shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {steps[idx].number} {steps[idx].title}
            </h3>
            <p className="text-gray-900 text-sm lg:text-md">{steps[idx].description}</p>
          </div>

          {/* Optional: step indicator */}
          <div className="mt-3 flex justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={next}
          aria-label="Next"
          className="p-2 rounded-full bg-white/90 text-[#2B4468] hover:bg-white transition"
        >
          {/* Right chevron */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* md+ screens: original grid, 4 in a row */}
      <div className="hidden md:grid max-w-6xl mx-auto grid-cols-4 gap-3 lg:gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-3 lg:p-6 rounded-lg text-left text-[#2B4468] shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            <h3 className="text-md lg:text-xl font-bold mb-2">
              {step.number} {step.title}
            </h3>
            <p className="text-gray-900 text-sm lg:text-md">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FourSteps;
