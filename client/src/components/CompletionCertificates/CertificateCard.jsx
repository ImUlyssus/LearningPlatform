import { useNavigate } from 'react-router-dom';

const CertificateCard = ({
  certificateId, // The ID of the certificate itself
  courseImage,   // Image of the completed course (will now be a URL)
  courseTitle,   // Title of the completed course
  courseDuration // Duration of the completed course
}) => {
  const navigate = useNavigate();

  const handleViewCertificateClick = () => {
    navigate(`/verify/${certificateId}`); // Navigate to the route with the certificate ID
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      {/* The img tag will now receive the actual image URL */}
      <img src={courseImage} alt={courseTitle} className="w-full h-40 sm:h-44 md:h-36 lg:h-48 object-cover" />

      <div className="p-4 md:p-3 lg:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2 md:mb-2 lg:mb-3">
          <h3 className="flex-1 min-w-0 text-sm md:text-md lg:text-xl font-bold text-gray-800">
            {courseTitle}
          </h3>
          <div className="ml-2 shrink-0 whitespace-nowrap flex items-center text-gray-600 text-xs md:text-xs lg:text-sm pt-[2px] md:pt-1 lg:pt-2">
            <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="leading-none">{courseDuration}</span>
          </div>
        </div>

        {/* Removed description text */}

        <div className="mt-auto pt-3 md:pt-3 lg:pt-4 flex items-center justify-center">
          <button
            onClick={handleViewCertificateClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm md:text-base lg:text-base hover:bg-blue-600 transition-colors duration-200 w-full"
          >
            View Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
