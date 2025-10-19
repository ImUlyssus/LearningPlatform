import { useState, useEffect } from 'react'; // Add useState and useEffect
import { getEntityImageStreamUrl } from '../../services/fileService'; // Assuming this path

const LecturerCard = ({ lecturer, onRemove }) => {
  const [imageUrl, setImageUrl] = useState(null); // State to store the fetched image URL

  useEffect(() => {
    const fetchLecturerImage = async () => {
      if (lecturer && lecturer.id) {
        try {
          // 'lecturer' as entityType, lecturer.id as the ID
          const url = await getEntityImageStreamUrl(lecturer.id, 'lecturer');
          setImageUrl(url || 'https://via.placeholder.com/80'); // Use placeholder if no image found
        } catch (error) {
          console.error(`Error fetching image for lecturer ${lecturer.id}:`, error);
          setImageUrl('https://via.placeholder.com/80'); // Fallback on error
        }
      } else {
        setImageUrl('https://via.placeholder.com/80'); // Fallback if lecturer or ID is missing
      }
    };

    fetchLecturerImage();
  }, [lecturer]); // Re-run effect when the lecturer prop changes

  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white w-32 shrink-0">
      <img
        src={imageUrl} // Use the fetched imageUrl
        alt={lecturer.username}
        className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-blue-500"
      />
      <p className="text-sm font-medium text-gray-800 text-center truncate w-full mb-2">
        {lecturer.username}
      </p>
      <button
        onClick={() => onRemove(lecturer.id)}
        className="w-full bg-red-50 text-red-600 border border-red-300 rounded-md py-1 text-xs font-semibold hover:bg-red-100 transition-colors"
      >
        Remove
      </button>
    </div>
  );
};

export default LecturerCard;
