// src/components/CourseManagementCard/CourseManagementCard.jsx
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DefaultThumbnail from '../../assets/default-thumbnail.png'

// Added onStatusChange to props
const CourseManagementCard = ({ course, image, onDelete, onUpdate, onStatusChange }) => { // <--- ADD 'image' PROP HERE
  const isDraft = course.status === 'draft';
  const isPublished = course.status === 'published';
  const navigate = useNavigate();

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} Mins`;
    const hrs   = Math.floor(minutes / 60);
    const mins  = minutes % 60;
    return mins === 0 ? `${hrs} Hrs` : `${hrs} Hrs ${mins} Mins`;
  };

  const handleUpdateClick = () => onUpdate?.(course.id);

  const handleDeleteClick = async () => {
    onDelete?.(course.id);
  };

  const handleStatusChangeClick = () => {
    if (isDraft) {
      onStatusChange?.(course.id, 'published');
    } else if (isPublished) {
      onStatusChange?.(course.id, 'draft');
    }
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
      {/* UPDATE THIS IMG TAG */}
      <img
        src={image || DefaultThumbnail} // Use the provided 'image' prop, or fallback to DefaultThumbnail
        alt={course.title}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevents infinite looping if the fallback also fails
          e.target.src = DefaultThumbnail; // Fallback to the default thumbnail on error
        }}
      />
      {/* END OF UPDATE */}

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="flex-1 text-sm md:text-md font-bold text-gray-800 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatDuration(course.duration)}
          </div>
        </div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="flex-1 text-lg font-bold text-gray-800 line-clamp-2">
            ID: {course.id}
          </h3>
        </div>

        <div className="mt-auto flex justify-end gap-2 pt-4">
          {isDraft && (
            <>
              <button
                onClick={handleDeleteClick}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={handleStatusChangeClick}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Publish
              </button>
            </>
          )}
          {isPublished && (
            <button
              onClick={handleStatusChangeClick}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
            >
              Draft
            </button>
          )}
          <button
            onClick={handleUpdateClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseManagementCard;
