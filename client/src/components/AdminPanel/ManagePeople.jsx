import { useState, useEffect } from 'react';
import UserCard from '../UserCard/UserCard';
import ManagePeopleDialog from '../ManagePeopleDialog/ManagePeopleDialog';
import { addManager, addLecturer } from '../../services/userService'; // Import API functions

const ManagePeople = ({
    managers: initialManagers, // Renamed to initialManagers to avoid conflict with state
    lecturers: initialLecturers, // Renamed to initialLecturers
    onDeleteManager,
    onDeleteLecturer,
}) => {
    const [showAddManagerDialog, setShowAddManagerDialog] = useState(false);
    const [showAddLecturerDialog, setShowAddLecturerDialog] = useState(false);

    // Using internal state for managers and lecturers to allow immediate updates after adding
    const [managers, setManagers] = useState(initialManagers);
    const [lecturers, setLecturers] = useState(initialLecturers);

    // Update internal state when initial props change (e.g., on data fetch from parent)
    useEffect(() => {
        setManagers(initialManagers);
    }, [initialManagers]);

    useEffect(() => {
        setLecturers(initialLecturers);
    }, [initialLecturers]);

    // Handler for adding a manager, wraps the API call
    const handleAddManagerRequest = async (userId) => {
        try {
            const response = await addManager(userId);
            // Assuming the backend response for adding a manager includes the new manager's data
            if (response.data && response.data.manager) {
                setManagers(prev => [...prev, response.data.manager]);
            }
            return response; // Return response to AddUserDialog for success message
        } catch (error) {
            console.error("Failed to add manager:", error);
            throw error; // Re-throw to be caught by AddUserDialog for error display
        }
    };

    // Handler for adding a lecturer, wraps the API call
    const handleAddLecturerRequest = async (userId) => {
        try {
            const response = await addLecturer(userId);
            // Assuming the backend response for adding a lecturer includes the new lecturer's data
            if (response.data && response.data.lecturer) {
                setLecturers(prev => [...prev, response.data.lecturer]);
            }
            return response;
        } catch (error) {
            console.error("Failed to add lecturer:", error);
            throw error;
        }
    };

    return (
        <div className="space-y-10">
            {/* Managers Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Managers</h2>
                    <button
                        onClick={() => setShowAddManagerDialog(true)} // Open dialog
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Add new manager
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {managers.length > 0 ? (
                        managers.map((manager) => (
                            <UserCard
                                key={manager.id}
                                user={manager}
                                onDelete={onDeleteManager}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No managers found.</p>
                    )}
                </div>
            </section>

            {/* Lecturers Section */}
            <section className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-2 border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Lecturers</h2>
                    <button
                        onClick={() => setShowAddLecturerDialog(true)} // Open dialog
                        className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Add new lecturer
                    </button>
                </div>
                {/* Information box */}
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 text-sm">
                    <p>
                        <span className="font-semibold">Note:</span> The lecturers here are from the User table, not from the Lecturer table.
                        Lecturers here will be used to allow access to all courses to learn as an incentive.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {lecturers.length > 0 ? (
                        lecturers.map((lecturer) => (
                            <UserCard
                                key={lecturer.id}
                                user={lecturer}
                                onDelete={onDeleteLecturer}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No lecturers found.</p>
                    )}
                </div>
            </section>


            {/* Add Manager Dialog */}
            <ManagePeopleDialog
                isOpen={showAddManagerDialog}
                onClose={() => setShowAddManagerDialog(false)}
                title="Add New Manager"
                onAddUser={handleAddManagerRequest}
                successMessage="Manager added successfully!"
                errorMessage="Failed to add manager."
            />

            {/* Add Lecturer Dialog */}
            <ManagePeopleDialog
                isOpen={showAddLecturerDialog}
                onClose={() => setShowAddLecturerDialog(false)}
                title="Add New Lecturer"
                onAddUser={handleAddLecturerRequest}
                successMessage="Lecturer added successfully!"
                errorMessage="Failed to add lecturer."
            />
        </div>
    );
};

export default ManagePeople;
