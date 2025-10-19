import React from 'react';
import { WEBSITE_NAME } from '../../constants'; // Import the website name constant
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {WEBSITE_NAME}. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-3 md:space-x-6 text-xs md:text-sm">
          <a href="/privacy-policy" className="text-gray-400 hover:text-white">Privacy Policy</a>
          <a href="/terms-of-service" className="text-gray-400 hover:text-white">Terms of Service</a>
          <a href="/contact-us" className="text-gray-400 hover:text-white">Contact Us</a>
          {/* <a href="/about-us" className="text-gray-400 hover:text-white">About Us</a> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
