// src/pages/NotFoundPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const [countdown, setCountdown] = useState(5); // Start countdown from 5 seconds
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the timer for automatic redirection
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer); // Stop the timer
          navigate('/'); // Redirect to the home page
          return 0;
        }
        return prevCountdown - 1; // Decrement countdown
      });
    }, 1000); // Update every second

    // Cleanup function to clear the interval if the component unmounts
    return () => clearInterval(timer);
  }, [navigate]); // Dependency array includes navigate to ensure effect re-runs if navigate changes (though it's stable)

  // Handler for the "Back Home" button
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="text-center">
        {/* Large 404 text */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-4 text-gray-900">
          404
        </h1>
        {/* Main error message */}
        <p className="text-2xl md:text-3xl font-semibold mb-2">
          Oops! Page not found.
        </p>
        {/* Secondary message */}
        <p className="text-lg md:text-xl mb-8">
          The page you're looking for is now beyond our reach.
          <br />
          Let's get you back home...
        </p>
        {/* Action buttons/countdown */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
          >
            Back Home
          </button>
          {/* Countdown display */}
          <div className="text-xl font-mono text-gray-700">
            Redirecting in {countdown}s
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
