// src/components/CourseCard/CourseCard.jsx
import { useNavigate } from 'react-router-dom';
import DefaultThumbnail from '../../assets/default-thumbnail.png'

const CourseCard = ({
  image,
  title,
  duration,
  description,
  price,
  id,
  footerVariant = 'default',
  onRecover,
  onReadMore,
  // Removed isSubCourse prop
}) => {
  const navigate = useNavigate();

  const handleReadMoreClick = () => {
    if (onReadMore) {
      onReadMore();
    } else {
      const hyphenCount = (id.match(/-/g) || []).length;

      if (hyphenCount === 3) {
        navigate(`/sub-course/${id}`);
      } else if (hyphenCount === 2) {
        navigate(`/course-detail/${id}`);
      } else {
        console.warn(`Unexpected ID format for navigation: ${id}. Defaulting to course-detail.`);
        navigate(`/course-detail/${id}`);
      }
    }
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      {/* UPDATE THIS IMG TAG */}
      <img
        src={image || DefaultThumbnail} // Use the provided 'image' prop, or fallback to DefaultThumbnail
        alt={title}
        className="w-full h-40 sm:h-44 md:h-36 lg:h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevents infinite looping if the fallback also fails
          e.target.src = DefaultThumbnail; // Fallback to the default thumbnail on error
        }}
      />
      {/* END OF UPDATE */}

      <div className="p-4 md:p-3 lg:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2 md:mb-2 lg:mb-3">
          <h3 className="flex-1 min-w-0 text-xs md:text-sm lg:text-lg font-bold text-gray-800">
            {title}
          </h3>
          <div className="ml-2 shrink-0 whitespace-nowrap flex items-center text-gray-600 text-xs md:text-xs lg:text-sm pt-[2px] md:pt-1 lg:pt-2">
            <svg className="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="leading-none text-xs md:text-sm">{duration}</span>
          </div>
        </div>

        <p className="text-gray-600 text-xs lg:text-sm line-clamp-3">
          {description}
        </p>

        <div className="mt-auto pt-3 md:pt-3 lg:pt-4 flex items-center justify-between">
          {footerVariant === 'recover' ? (
            <button
              onClick={onRecover}
              className="w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Recover
            </button>
          ) : (
            <>
              <span className="text-green-600 text-base md:text-base lg:text-lg font-bold">{price}</span>
              <button
                onClick={handleReadMoreClick}
                className="bg-blue-500 text-white px-3 py-1.5 md:px-3 md:py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm md:text-xs lg:text-sm hover:bg-blue-600 transition-colors duration-200"
              >
                Read more
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
