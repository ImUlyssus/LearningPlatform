// src/components/AddLecturerDialog.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import { searchLecturerByEmail } from '../../services/lecturer'; // Specific service for searching lecturers

// Set app element for react-modal (important for accessibility)
Modal.setAppElement('#root'); // Or whatever your root element ID is

const AddLecturerDialog = ({
  isOpen,
  onClose,
  onAddLecturerSuccess, // Callback to pass the selected lecturer back to the parent
  onCreateNewLecturerClick, // Callback to navigate to the create new lecturer page
}) => {
  const [email, setEmail] = useState('');
  const [foundLecturer, setFoundLecturer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setFoundLecturer(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!email) {
      setError('Please enter an email address to search for a lecturer.');
      setFoundLecturer(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFoundLecturer(null);

    try {
      const response = await searchLecturerByEmail(email); // Use the specific lecturer search function
      if (response.data && response.data.lecturer) {
        setFoundLecturer(response.data.lecturer);
        toast.success('Lecturer found!');
      } else {
        setError('No lecturer found with that email.'); // Specific message for lecturer
      }
    } catch (err) {
      console.error('Error searching lecturer:', err);
      setError(err.response?.data?.message || 'Failed to search for lecturer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNow = () => {
    if (foundLecturer) {
      onAddLecturerSuccess(foundLecturer); // Pass the found lecturer object to the parent
      onClose(); // Close the dialog
    }
  };

  const handleCreateNew = () => {
    onCreateNewLecturerClick(); // Trigger the navigation callback in the parent
    onClose(); // Close the dialog
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Add Lecturer Dialog"
      className="modal-content p-6 bg-white rounded-lg shadow-xl max-w-lg mx-auto my-20"
      overlayClassName="modal-overlay fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Add Lecturer</h2>
      <div className="space-y-4">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <input
            type="email"
            placeholder="Enter email to find lecturer"
            className="flex-grow p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button
            onClick={handleSearch}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {foundLecturer && (
          <div className="flex justify-between items-center border border-gray-300 rounded-md p-3">
            <span className="font-medium text-gray-700">{foundLecturer.username || foundLecturer.email}</span>
            <button
              onClick={handleAddNow}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add now
            </button>
          </div>
        )}

        {!foundLecturer && !isLoading && email && error && ( // Show create button only if search was performed and no one was found
          <div className="flex flex-col items-center mt-4">
            <p className="text-gray-600 mb-2">Can't find the lecturer?</p>
            <button
              onClick={handleCreateNew}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create New Lecturer
            </button>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-4">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddLecturerDialog;
