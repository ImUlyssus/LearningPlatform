// src/LecturerCard/LecturerCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEntityImageStreamUrl } from '../../services/fileService'; // Adjust path if necessary
import { Edit, Trash2, RotateCcw } from 'lucide-react'; // Example icons

// Define a default placeholder for the lecturer image
const DEFAULT_LECTURER_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/128/682B44/FFFFFF?text=Lecturer';

const LecturerCard = ({ lecturer, onDelete, onRecover }) => {
  const [lecturerImageUrl, setLecturerImageUrl] = useState(DEFAULT_LECTURER_IMAGE_PLACEHOLDER);

  // Fetch the lecturer's image when the component mounts or lecturer.id changes
  useEffect(() => {
    const fetchImage = async () => {
      if (lecturer.id) {
        try {
          const imageUrl = await getEntityImageStreamUrl(lecturer.id, 'lecturer'); // 'lecturer' is the entityType
          setLecturerImageUrl(imageUrl || DEFAULT_LECTURER_IMAGE_PLACEHOLDER);
        } catch (error) {
          console.error(`Error fetching image for lecturer ${lecturer.id}:`, error);
          setLecturerImageUrl(DEFAULT_LECTURER_IMAGE_PLACEHOLDER); // Fallback to placeholder on error
        }
      }
    };
    fetchImage();
  }, [lecturer.id]); // Dependency array ensures effect runs when lecturer.id changes

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col items-center">
        {/* Lecturer Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-300 mb-4 flex-shrink-0">
          <img
            src={lecturerImageUrl} // Use the fetched image URL
            alt={lecturer.username}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lecturer Details */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">{lecturer.username}</h3>
        <p className="text-gray-600 text-sm mb-1">{lecturer.email}</p>
        {lecturer.phone && <p className="text-gray-600 text-sm mb-2">{lecturer.phone}</p>}
        {lecturer.bio && (
          <p className="text-gray-700 text-sm text-center line-clamp-3 mb-4">
            {lecturer.bio}
          </p>
        )}
        {lecturer.is_deleted && (
          <span className="text-red-500 font-medium text-sm mb-2">
            (Deleted)
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200 flex justify-center gap-3">
        <Link
          to={`/manage-lecturers/update/${lecturer.id}`}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Link>
        {!lecturer.is_deleted ? (
          <button
            onClick={() => onDelete(lecturer.id)}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </button>
        ) : (
          <button
            onClick={() => onRecover(lecturer.id)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Recover
          </button>
        )}
      </div>
    </div>
  );
};

export default LecturerCard;
