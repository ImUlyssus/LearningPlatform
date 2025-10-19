import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Import your API functions for initial data loading and updates
import {
    getUserProfile, // Assuming this fetches the current user's details
    // You might have dedicated API calls to fetch all managers and lecturers initially
    // e.g., fetchAllManagers, fetchAllLecturers
    addManager,
    addLecturer,
    removeManager,
    removeLecturer,
    // Add other update functions if needed, like updateManager, updateLecturer
} from '../services/user'; // Adjust path to your API service file

// 1. Create the Context
// It holds the state and any functions to update that state.
// The default value here is what `useContext` returns if no Provider is found above it.
export const PeopleContext = createContext(null);

// 2. Create a Provider Component
// This component will wrap parts of your application that need access to the context.
export const PeopleProvider = ({ children }) => {
    // State variables for your global data
    const [managers, setManagers] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch initial data (managers and lecturers)
    // This typically runs once when the provider mounts
    // const fetchInitialPeopleData = useCallback(async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         // Replace with your actual API calls to fetch all managers and lecturers
    //         // Example:
    //         // const managersResponse = await fetchAllManagers();
    //         // const lecturersResponse = await fetchAllLecturers();
    //         // setManagers(managersResponse.data);
    //         // setLecturers(lecturersResponse.data);

    //         // For now, simulating a fetch with dummy data
    //         const dummyManagers = [
    //             { id: 1, username: 'Alice Smith', email: 'alice@example.com', user_role: 6355 },
    //             { id: 2, username: 'Bob Johnson', email: 'bob@example.com', user_role: 6355 },
    //         ];
    //         const dummyLecturers = [
    //             { id: 3, username: 'Charlie Brown', email: 'charlie@example.com', user_role: 3840 },
    //             { id: 4, username: 'Diana Prince', email: 'diana@example.com', user_role: 3840 },
    //         ];
    //         setManagers(dummyManagers);
    //         setLecturers(dummyLecturers);

    //     } catch (err) {
    //         console.error("Error fetching initial people data:", err);
    //         setError(err.message || "Failed to load initial data.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // useEffect(() => {
    //     fetchInitialPeopleData();
    // }, [fetchInitialPeopleData]);

    // --- Functions to update the state, mimicking your API calls ---
    // These functions will also call the backend API and then update the local context state.

    const addManagerToContext = async (userId, managerData) => {
        try {
            const response = await addManager(userId); // Call your API
            const newManager = response.data.manager || managerData; // Use response data or fallback
            setManagers(prev => [...prev, newManager]);
            return newManager;
        } catch (err) {
            console.error("Error adding manager via context:", err);
            throw err; // Re-throw to allow component to handle error message
        }
    };

    const addLecturerToContext = async (userId, lecturerData) => {
        try {
            const response = await addLecturer(userId); // Call your API
            const newLecturer = response.data.lecturer || lecturerData;
            setLecturers(prev => [...prev, newLecturer]);
            return newLecturer;
        } catch (err) {
            console.error("Error adding lecturer via context:", err);
            throw err;
        }
    };

    const removeManagerFromContext = async (managerId) => {
        try {
            await removeManager(managerId); // Call your API
            setManagers(prev => prev.filter(m => m.id !== managerId));
        } catch (err) {
            console.error("Error removing manager via context:", err);
            throw err;
        }
    };

    const removeLecturerFromContext = async (lecturerId) => {
        try {
            await removeLecturer(lecturerId); // Call your API
            setLecturers(prev => prev.filter(l => l.id !== lecturerId));
        } catch (err) {
            console.error("Error removing lecturer via context:", err);
            throw err;
        }
    };

    // The value that will be provided to consumers of this context
    const contextValue = {
        managers,
        lecturers,
        loading,
        error,
        addManager: addManagerToContext,
        addLecturer: addLecturerToContext,
        removeManager: removeManagerFromContext,
        removeLecturer: removeLecturerFromContext,
        // You can add more state or functions here (e.g., updateManager, fetchPeopleData)
    };

    return (
        <PeopleContext.Provider value={contextValue}>
            {children}
        </PeopleContext.Provider>
    );
};

// 3. Create a custom hook for convenience
// This makes consuming the context cleaner in components.
export const usePeople = () => {
    const context = useContext(PeopleContext);
    if (context === null) {
        throw new Error('usePeople must be used within a PeopleProvider');
    }
    return context;
};
