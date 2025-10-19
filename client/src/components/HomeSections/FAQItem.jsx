import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      <button
        className="w-full text-left px-6 py-3 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm md:text-lg font-semibold text-gray-800">{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-700 ${ // Reduced SVG duration for snappier feedback
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>

      {/* The key changes are here: */}
      <div
        className={`
          overflow-hidden transition-all duration-700 ease-in-out
          ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="text-sm md:text-base px-6 pb-6 pt-0 text-gray-700 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default FAQItem;
