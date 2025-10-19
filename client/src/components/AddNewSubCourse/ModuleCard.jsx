// src/pages/ModuleCard.jsx
// Add isLastModule to the props destructuring
const ModuleCard = ({ module, onDelete, onUpdate, isLastModule }) => {
  return (
    // Make the outer div a flex container with column direction
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
      {/* This div will contain the module title and ID.
          Add 'flex-grow' to make it expand and push content below it. */}
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{module.title}</h3>
        <p className="text-gray-600 text-sm">ID: {module.id}</p>
      </div>

      {/* This div contains the buttons.
          Move it outside the 'p-4' content div but still inside the main card div.
          Add 'px-4 pb-4' for consistent padding, and keep 'mt-4' for spacing from the content above. */}
      <div className="px-4 pb-4 mt-4 flex justify-end gap-2">
        
        {/* Conditionally render the Delete button */}
        {isLastModule && (
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        )}
        <button
          onClick={onUpdate}
          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;
