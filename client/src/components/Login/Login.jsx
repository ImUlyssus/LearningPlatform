// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth'; // Adjust the import path if necessary
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    // Restrict input length to 100 characters
    const { name, value } = e.target;
    if (value.length > 100) {
      return; // Do not update state if length exceeds 100
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    // --- Client-side Validation ---

    // 1. Check if both fields are filled
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      showErrorNotification("Please enter both email and password.");
      return;
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      showErrorNotification("Please enter a valid email address.");
      return;
    }

    // 3. Validate Password Complexity (at least 6 chars, with letter and number)
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      showErrorNotification("Password must be at least 6 characters long.");
      return;
    }
    if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError("Password must contain at least one letter and one number.");
      showErrorNotification("Password must contain at least one letter and one number.");
      return;
    }

    setLoading(true); // Start loading state

    try {
      const response = await loginUser(formData.email, formData.password);
      showSuccessNotification('Login successful! Redirecting...');
      setSuccess("Login successful! Redirecting...");

      // Store the token (e.g., in localStorage or a state management solution)
      localStorage.setItem('token', response.data.token);
      // Optionally, store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to a dashboard or home page
      setTimeout(() => {
        navigate('/'); // Change this to your desired post-login route
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        showErrorNotification(err.response.data.message);
        setError(err.response.data.message); // Display error message from backend
      } else {
        showErrorNotification("An unexpected error occurred during login.");
        setError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  // --- Notification Functions ---
  const showSuccessNotification = (successMessage) => {
    toast.success(successMessage);
  };

  const showErrorNotification = (errorMessage) => {
    toast.error(errorMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2B4468] to-[#1c2c44] p-6">
      <Toaster />
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-[#2B4468] text-3xl font-extrabold mb-8">
          Welcome Back 👋
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2B4468] focus:border-[#2B4468] outline-none transition"
              required
              maxLength={100} // Input length restriction
            />
          </div>
          <div className="text-left">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2B4468] focus:border-[#2B4468] outline-none transition"
              required
              maxLength={100} // Input length restriction
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-left mt-2">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm text-left mt-2">{success}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-xl bg-[#2B4468] text-white text-lg font-semibold shadow-lg hover:bg-[#1f3350] transform hover:-translate-y-0.5 transition-all"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-600 space-x-4">
          <Link
            to="/register"
            className="text-[#2B4468] hover:underline hover:text-[#1f3350] transition"
          >
            Register
          </Link>
          <Link
            to="/forgot-password"
            className="text-[#2B4468] hover:underline hover:text-[#1f3350] transition"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
