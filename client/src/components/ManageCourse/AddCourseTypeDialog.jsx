// src/components/AddCourseTypeDialog.jsx
import Modal from 'react-modal';

// Set app element for react-modal (important for accessibility)
// Modal.setAppElement('#root'); // Or whatever your root element ID is

const AddCourseTypeDialog = ({ isOpen, onClose, onSelectSingleSub, onSelectMultipleSub }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content p-6 bg-white rounded-lg shadow-xl max-w-sm mx-auto my-20"
      // Changed overlayClassName here:
      overlayClassName="modal-overlay fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Add New Course</h2>
      <p className="text-gray-700 mb-6 text-center">
        Will this course have multiple sub-courses?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onSelectSingleSub}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          No (Single Sub-Course)
        </button>
        <button
          onClick={onSelectMultipleSub}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Yes (Multiple Sub-Courses)
        </button>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default AddCourseTypeDialog;
