import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendContactUsEmail } from '../../services/emailService'; // Import the email service
import toast, { Toaster } from 'react-hot-toast'; // For notifications

const ContactUs = () => {
  const [name, setName] = useState(''); // New state for user's name
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for button

  // Define character limits
  const NAME_MAX_LENGTH = 100;
  const EMAIL_MAX_LENGTH = 254; // Standard maximum length for email addresses
  const SUBJECT_MAX_LENGTH = 250;
  const MESSAGE_MAX_LENGTH = 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Basic client-side validation including length checks
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (name.length > NAME_MAX_LENGTH) {
      toast.error(`Name cannot exceed ${NAME_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }
    if (email.length > EMAIL_MAX_LENGTH) {
      toast.error(`Email cannot exceed ${EMAIL_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }
    if (subject.length > SUBJECT_MAX_LENGTH) {
      toast.error(`Subject cannot exceed ${SUBJECT_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }
    if (message.length > MESSAGE_MAX_LENGTH) {
      toast.error(`Message cannot exceed ${MESSAGE_MAX_LENGTH} characters.`);
      setLoading(false);
      return;
    }

    try {
      await sendContactUsEmail({
        userEmail: email,
        userName: name,
        userMessage: `Subject: ${subject}\n\nMessage: ${message}`,
      });

      toast.success('Thank you for your message! A confirmation email has been sent to your address. We will get back to you soon.');
      
      // Reset form fields after successful submission
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

    } catch (error) {
      console.error('Error sending contact us message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send your message. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Toaster /> {/* Place Toaster for notifications */}

      {/* Top Header Section (Light Blue Background) */}
      <div className="w-full bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Questions, bug reports, feedback, feature requests — we're here for it all. We'd love to hear from you.
        </p>
      </div>

      {/* Form Section (White Card with Shadow) */}
      <div className="w-[90%] md:w-full max-w-xl mx-auto -mt-8 mb-10 bg-white shadow-xl rounded-lg p-8 z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={NAME_MAX_LENGTH} // Added max length
            />
          </div>

          {/* Email Address Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={EMAIL_MAX_LENGTH} // Added max length
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={SUBJECT_MAX_LENGTH} // Added max length
            />
          </div>

          {/* How can we help? Field (Textarea) */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              How can we help?
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              maxLength={MESSAGE_MAX_LENGTH} // Added max length
            ></textarea>
          </div>

          {/* SEND Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading} // Disable button when loading
            >
              {loading ? 'Sending...' : 'SEND'}
            </button>
          </div>
        </form>

        {/* Privacy Policy Link */}
        <div className="mt-6 text-center">
          <Link to="/privacy-policy" className="text-blue-500 hover:text-blue-600 text-sm">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
