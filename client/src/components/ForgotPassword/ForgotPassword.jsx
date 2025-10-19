// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/auth'; // Import the new service function
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // For displaying success/error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.data.message); // This will be "If an account with that email exists..."
      toast.success(response.data.message);
      setEmail(""); // Clear the email field after sending
    } catch (error) {
      console.error("Forgot password request error:", error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-[#2B4468] mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none mb-4"
            required
          />

          {message && (
            <p className={`mb-4 text-center ${message.includes('exists') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#2B4468] text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-[#2B4468] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
