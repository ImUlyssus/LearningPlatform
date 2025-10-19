// src/context/CourseContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getNestedCourses } from '../services/courseService'; // Your new service function

// Create the context
const CourseContext = createContext(undefined);

// Create a provider component
export const CourseProvider = ({ children }) => {
  const [nestedCourses, setNestedCourses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoursesData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const response = await getNestedCourses();
      setNestedCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch nested courses:', err);
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesData();
  }, [fetchCoursesData]);

  // The value that will be provided to consumers
  const contextValue = {
    nestedCourses,
    isLoading,
    isError,
    error,
    refetchCourses: fetchCoursesData, // Optionally expose a refetch function
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook to use the course context easily
export const useCourses = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
