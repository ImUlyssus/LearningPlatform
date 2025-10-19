import React, { useState } from 'react';
import { X, Mail, Banknote } from 'lucide-react'; // Importing necessary icons

// Helper function to format currency, assuming 'Ks' for Myanmar Kyat
const formatCost = (cost) => {
  if (cost === undefined || cost === null) return 'N/A';
  return `${cost.toLocaleString()}Ks`;
};

// Dummy Bank Account Data
const DUMMY_BANK_ACCOUNTS = [
  { name: 'KBZ Bank', accountName: 'Your Business Name', accountNumber: '123-456-789-001' },
  { name: 'CB Bank', accountName: 'Your Business Name', accountNumber: '987-654-321-002' },
  { name: 'AYA Bank', accountName: 'Your Business Name', accountNumber: '555-111-222-003' },
];

// Nested Bank Details Dialog Component
const BankDetailsDialog = ({ isOpen, onClose, bankAccounts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-sm mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
          aria-label="Close bank details dialog"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
          Bank Account Details
        </h3>
        <div className="space-y-4">
          {bankAccounts.map((bank, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-gray-800 font-semibold text-lg">{bank.name}</p>
              <p className="text-gray-600 text-sm">Account Name: <span className="font-medium">{bank.accountName}</span></p>
              <p className="text-gray-600 text-sm">Account No: <span className="font-medium">{bank.accountNumber}</span></p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 text-base
                       transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const EnrollmentInstructionsDialog = ({
  isOpen,           // Boolean to control dialog visibility
  onClose,          // Function to call when the dialog should close
  normalPrice,      // The original price of the course (e.g., courseData.cost)
  discountedPrice,  // The price after discount
  formLink,         // URL for the Google Form
  facebookLink,     // URL for Facebook contact
}) => {
  if (!isOpen) return null; // Don't render if not open

  // State to control visibility of the nested bank details dialog
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Determine if there's an actual discount
  const hasDiscount = discountedPrice !== undefined && discountedPrice !== null && normalPrice !== undefined && normalPrice !== null && discountedPrice < normalPrice;

  // Calculate discount percentage for display
  const calculatedDiscountPercentage = hasDiscount
    ? Math.round(((normalPrice - discountedPrice) / normalPrice) * 100)
    : null;

  return (
    // Updated: Added backdrop-blur-sm and changed background to bg-black/30 for transparency
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto transform transition-all scale-100 opacity-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Dialog Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
          How to Enroll
        </h2>

        {/* Price Display Section */}
        {hasDiscount ? (
          <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
            <div className="flex flex-col items-center p-3 border border-red-300 bg-red-50 rounded-md min-w-[140px]">
              <span className="text-red-500 text-sm font-semibold">Normal Price</span>
              <span className="text-red-600 text-xl md:text-2xl font-bold line-through">
                {formatCost(normalPrice)}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 border border-green-300 bg-green-50 rounded-md min-w-[140px]">
              <span className="text-green-600 text-sm font-semibold">
                Now {calculatedDiscountPercentage}% Off
              </span>
              <span className="text-green-700 text-xl md:text-2xl font-bold">
                {formatCost(discountedPrice)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-6">
            <div className="flex flex-col items-center p-3 border border-blue-300 bg-blue-50 rounded-md min-w-[180px]">
              <span className="text-blue-600 text-sm font-semibold">Course Fee</span>
              <span className="text-blue-700 text-xl md:text-2xl font-bold">
                {formatCost(normalPrice)}
              </span>
            </div>
          </div>
        )}

        <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed text-center">
          You can easily enroll in this course by following two simple steps:
        </p>

        {/* Enrollment Steps */}
        <div className="space-y-6 mb-8">
          {/* Step 1: Transfer Course Fee */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                Transfer Course Fee
              </h3>
              <p className="text-gray-700 text-sm md:text-base">
                Please transfer the course fee to any of{' '}
                {/* Changed to a button to open nested dialog */}
                <button
                  onClick={() => setShowBankDetails(true)}
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                >
                  these banking accounts <Banknote className="w-4 h-4" />
                </button>.
              </p>
            </div>
          </div>

          {/* Step 2: Fill Out Your Information */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                Fill Out Your Information
              </h3>
              <p className="text-gray-700 text-sm md:text-base">
                Please fill in your information in{' '}
                <a
                  href={formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  this form
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Important Note / Confirmation Message */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-yellow-600 mt-1">
              <Mail className="w-5 h-5 md:w-6 h-6" />
            </div>
            <div className="ml-3">
              <p className="text-sm md:text-base text-yellow-800">
                You will receive an email about your enrollment status within 24 hours. If you do not receive any email within 24 hours, please contact us on{' '}
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Facebook
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 text-lg
                       transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Got It!
          </button>
        </div>
      </div>

      {/* Nested Bank Details Dialog */}
      <BankDetailsDialog
        isOpen={showBankDetails}
        onClose={() => setShowBankDetails(false)}
        bankAccounts={DUMMY_BANK_ACCOUNTS}
      />
    </div>
  );
};

export default EnrollmentInstructionsDialog;
