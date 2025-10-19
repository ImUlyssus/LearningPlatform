// src/components/AdminPanel/Promotion.jsx
import React, { useState } from 'react';
import PromotionCard from '../PromotionCard/PromotionCard';
import PromotionDialog from '../PromotionDialog/PromotionDialog'; // Corrected path to PromotionDialog


const Promotion = ({
  runningPromotions,
  scheduledPromotions,
  handleAddPromotion, // From AdminPanel
  handleUpdatePromotion, // From AdminPanel
  handleDeletePromotion, // From AdminPanel
  availableCourses,
}) => {
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState(null); // State to hold the promotion being edited

  const handleOpenAddPromotionModal = () => {
    setPromotionToEdit(null); // Ensure no promotion is being edited
    setIsPromotionModalOpen(true);
  };

  const handleOpenEditPromotionModal = (promotion) => {
    setPromotionToEdit(promotion); // Set the promotion to be edited
    setIsPromotionModalOpen(true);
  };

  const handleClosePromotionModal = () => {
    setIsPromotionModalOpen(false);
    setPromotionToEdit(null); // Clear the promotion to edit when modal closes
  };

  return (
    <div className="space-y-10">
      {/* Add New Promotion Button */}
      <div className="flex justify-start">
        <button
          onClick={handleOpenAddPromotionModal} // Open the modal for adding
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md text-md font-medium transition-colors shadow"
        >
          Add new promotion
        </button>
      </div>

      {/* Running Promotions Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Running Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {runningPromotions.length > 0 ? (
            runningPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onUpdate={() => handleOpenEditPromotionModal(promotion)} // Pass the promotion object for editing
                onDelete={handleDeletePromotion}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">No running promotions.</p>
          )}
        </div>
      </section>

      {/* Scheduled Promotions Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">Scheduled Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scheduledPromotions.length > 0 ? (
            scheduledPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onUpdate={() => handleOpenEditPromotionModal(promotion)}
                onDelete={handleDeletePromotion}
                availableCourses={availableCourses}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">No scheduled promotions.</p>
          )}
        </div>
      </section>

      {/* Promotion Dialog Component */}
      <PromotionDialog
        isOpen={isPromotionModalOpen}
        onClose={handleClosePromotionModal}
        onAdd={handleAddPromotion}
        onUpdate={handleUpdatePromotion}
        currentPromotion={promotionToEdit}
        availableCourses={availableCourses}
      />
    </div>
  );
};

export default Promotion;
