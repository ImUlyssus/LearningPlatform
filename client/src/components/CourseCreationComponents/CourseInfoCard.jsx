// src/components/CourseInfoCard.jsx
import { useState, useEffect } from 'react'; // <--- ADD useState, useEffect
import { getFileStreamUrl } from '../../services/fileService'; // <--- ADD THIS IMPORT
import DefaultThumbnail from '../../assets/default-thumbnail.png'

const CourseInfoCard = ({ courseInfo, onUpdate }) => {
  // Destructure properties from courseInfo, providing default empty objects
  // or values to prevent errors if courseInfo or its properties are null/undefined.
  const {
    id,
    title,
    // thumbnail, // <--- REMOVE THIS, we will fetch it dynamically
    overview,
    what_you_will_learn,
    skills,
    category,
    cost,
  } = courseInfo || {};

  // NEW STATE: To store the fetched thumbnail URL
  const [fetchedThumbnailUrl, setFetchedThumbnailUrl] = useState(null);

  // NEW EFFECT: Fetch the thumbnail URL when courseInfo.id changes
  useEffect(() => {
    const fetchThumbnail = async () => {
      if (id) { // Only fetch if an ID exists
        const url = await getFileStreamUrl(id, 'image');
        setFetchedThumbnailUrl(url);
      } else {
        setFetchedThumbnailUrl(null); // Clear if no ID
      }
    };

    fetchThumbnail();
  }, [id]); // Re-run when the course ID changes

  // Prepare display values, handling potential null/undefined and array types
  const displayId = id || 'N/A';
  const displayTitle = title || 'Untitled Course';
  // const displayThumbnail = thumbnail || 'https://via.placeholder.com/200x120?text=Course+Thumbnail'; // <--- REMOVE THIS LINE
  const displayOverview = overview || 'No overview provided.';

  // Format 'what_you_will_learn' as a list
  const displayWhatYouWillLearn = Array.isArray(what_you_will_learn) && what_you_will_learn.length > 0 ? (
    <ul className="list-disc list-inside text-gray-600 text-sm pl-4">
      {what_you_will_learn.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-600 text-sm">No learning outcomes listed.</p>
  );

  // Format 'skills' as a comma-separated string
  const displaySkills = Array.isArray(skills) && skills.length > 0
    ? skills.join(', ')
    : 'No specific skills mentioned.';

  // Format 'category' as a comma-separated string
  const displayCategory = Array.isArray(category) && category.length > 0
    ? category.join(', ')
    : 'Uncategorized';

  // Format 'cost'
  const displayCost = typeof cost === 'number'
    ? `MMK ${cost.toLocaleString()}`
    : 'Cost not set';

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="md:flex md:space-x-4">
        {/* Left Column: Thumbnail (2/5 width on md/lg) */}
        <div className="md:w-2/5 flex justify-center items-center mb-4 md:mb-0">
          {/* UPDATE THE IMG TAG */}
          <img
            src={fetchedThumbnailUrl || DefaultThumbnail} // <--- USE NEW STATE VARIABLE WITH FALLBACK
            alt="Course Thumbnail"
            className="w-full h-auto object-cover rounded-md shadow-md"
            onError={(e) => { // Add onError for robust fallback
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = DefaultThumbnail; // Fallback to default if fetched URL fails
            }}
          />
        </div>

        {/* Right Column: Details (3/5 width on md/lg) */}
        <div className="md:w-3/5 flex flex-col justify-between">
          {/* Course Title */}
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{displayTitle}</h3>
          </div>

          {/* Course ID */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Course ID: {displayId}</p>
          </div>

          {/* Category */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Category:</h4>
            <p className="text-gray-600 text-sm">{displayCategory}</p>
          </div>

          {/* Overview */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Overview:</h4>
            <p className="text-gray-600 text-sm mb-3">{displayOverview}</p>
          </div>

          {/* What you will learn */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">What you will learn:</h4>
            {displayWhatYouWillLearn}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Skills:</h4>
            <p className="text-gray-600 text-sm">{displaySkills}</p>
          </div>

          {/* Course Cost */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-2">Course Cost:</h4>
            <p className="text-lg font-bold text-green-600">{displayCost}</p>
          </div>

          {/* Update Button (optional, based on your flow) */}
          {onUpdate && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Update Course Info
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseInfoCard;
