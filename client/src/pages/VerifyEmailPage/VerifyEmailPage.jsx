// src/pages/VerifyEmailPage.jsx
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../../services/auth.js';
import toast, { Toaster } from 'react-hot-toast';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  // Use a ref to prevent re-running the verification logic if it's already been attempted
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Only proceed if verification hasn't been attempted yet
    if (verificationAttempted.current) {
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage('Verification token not found in URL.');
      toast.error('Verification token not found.');
      verificationAttempted.current = true; // Mark as attempted
      return; // Stop execution here
    }

    const handleVerification = async () => {
      // Mark as attempted so it doesn't run again on subsequent renders
      verificationAttempted.current = true;
      try {
        const response = await verifyEmail(token);
        setVerificationStatus('success');
        setMessage(response.data.message);
        toast.success(response.data.message);

        // Redirect to login after a short delay for user to read the message
        setTimeout(() => {
          navigate('/login');
        }, 3000); // 3 seconds
      } catch (err) {
        setVerificationStatus('error');
        let errorMessage = 'An unexpected error occurred during verification.';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    handleVerification();
  }, [location.search, navigate]); // Dependencies: re-run if URL search params or navigate object changes

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2B4468] to-[#1c2c44] p-6">
      <Toaster />
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-[#2B4468] text-3xl font-extrabold mb-8">
          Email Verification
        </h2>
        {/* Conditional rendering based on verificationStatus */}
        {verificationStatus === 'verifying' && (
          <p className="text-gray-700 text-lg">Verifying your email address...</p>
        )}
        {verificationStatus === 'success' && (
          <div className="text-green-600">
            <p className="text-lg font-semibold mb-4">{message}</p>
            <Link to="/login" className="text-[#2B4468] hover:underline">
              Go to Login
            </Link>
          </div>
        )}
        {verificationStatus === 'error' && (
          <div className="text-red-600">
            <p className="text-lg font-semibold mb-4">{message}</p>
            <Link to="/register" className="text-[#2B4468] hover:underline">
              Try Registering Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
