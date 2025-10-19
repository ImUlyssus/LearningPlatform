// src/AddNewSubCourse/LectureInputCard.jsx
import QuizInputSection from './QuizInputSection'; // Import the new QuizInputSection

// The onChange prop now expects (field, value), not (index, field, value)
// The onDelete prop now expects no arguments, as the parent will pass the correct tempKey
const LectureInputCard = ({ lecture, index, onChange, onDelete, isDeletable = true, hasExistingQuizLecture }) => {

  const isQuiz = lecture.type === 'quiz';

  // This handler will be passed down to QuizInputSection to update 'qa_data' or 'min_score_to_pass'
  const handleQuizDataChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Lecture {index + 1}</h3>
      <div className="mb-3">
        <label htmlFor={`lectureTitle-${index}`} className="block text-gray-700 text-sm font-bold mb-1">Lecture title:</label>
        <input
          type="text"
          id={`lectureTitle-${index}`}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={lecture.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <span className="block text-gray-700 text-sm font-bold mb-1">Lecture type:</span>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`lectureType-${index}`}
              value="video"
              checked={lecture.type === 'video'}
              onChange={() => onChange('type', 'video')}
            />
            <span className="ml-2 text-gray-700">Video</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`lectureType-${index}`}
              value="reading"
              checked={lecture.type === 'reading'}
              onChange={() => onChange('type', 'reading')}
            />
            <span className="ml-2 text-gray-700">Reading</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`lectureType-${index}`}
              value="quiz"
              checked={isQuiz}
              disabled={hasExistingQuizLecture && !isQuiz}
              onChange={() => onChange('type', 'quiz')}
            />
            <span className="ml-2 text-gray-700">Quiz</span>
          </label>
        </div>
      </div>

      {/* Duration field is present for all types, as per the image */}
      <div className="mb-4">
        <label htmlFor={`lectureDuration-${index}`} className="block text-gray-700 text-sm font-bold mb-1">Duration (minutes):</label>
        <input
          type="number"
          id={`lectureDuration-${index}`}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={lecture.duration || ''}
          onChange={(e) => onChange('duration', parseInt(e.target.value) || 0)}
          required
          min="0"
        />
      </div>

      {/* Conditional rendering for Lecture Link & Material vs. Quiz Section */}
      {!isQuiz ? (
        <>
          {/* Lecture File (now a link input) */}
          {/* <div className="mb-3">
            <label htmlFor={`lectureLink-${index}`} className="block text-gray-700 text-sm font-bold mb-1">Lecture Link:</label>
            <input
              type="url"
              id={`lectureLink-${index}`}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={lecture.link || ''}
              onChange={(e) => onChange('link', e.target.value)}
              placeholder="e.g., https://youtube.com/watch?v=..."
              required
            />
          </div> */}

          {/* Lecture Material (Optional - now a link input) */}
          {/* <div className="mb-3">
            <label htmlFor={`lectureMaterial-${index}`} className="block text-gray-700 text-sm font-bold mb-1">Lecture material (Optional):</label>
            <p className="text-xs text-gray-500 mb-1">(Please add a link to additional resources like PPT, PDF, etc.)</p>
            <input
              type="url"
              id={`lectureMaterial-${index}`}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={lecture.slides || ''}
              onChange={(e) => onChange('slides', e.target.value)}
              placeholder="e.g., https://docs.google.com/presentation/d/..."
            />
          </div> */}
        </>
      ) : (
        // Render QuizInputSection if lecture type is 'quiz'
        <QuizInputSection
          qaData={lecture.qa_data || []} // Pass the quiz data
          minScoreToPass={lecture.min_score_to_pass || 0} // Pass min score
          onQuizDataChange={handleQuizDataChange} // Callback to update parent lecture state
        />
      )}

      {isDeletable && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default LectureInputCard;
