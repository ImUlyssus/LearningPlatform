// src/components/SubCourseCard/SubCourseCard.jsx
import DefaultThumbnail from '../../assets/default-thumbnail.png'

const SubCourseCard = ({ subCourse, image }) => { // <--- ADD 'image' PROP HERE
  if (!subCourse) {
    return null;
  }

  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
      {/* UPDATE THIS IMG TAG */}
      <img
        src={image || DefaultThumbnail} // Use the provided 'image' prop, or fallback to DefaultThumbnail
        alt={subCourse.title}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevents infinite looping if the fallback also fails
          e.target.src = DefaultThumbnail; // Fallback to the default thumbnail on error
        }}
      />
      {/* END OF UPDATE */}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-md font-bold text-gray-800 line-clamp-2 mb-2">
          {subCourse.title}
        </h3>
        <p className="text-sm text-gray-600">
          ID: {subCourse.id}
        </p>
      </div>
    </div>
  );
};

export default SubCourseCard;
