// src/AddNewSubCourse/QuestionInputCard.jsx
import React from 'react';

// The onChange prop now expects the entire updated question object
const QuestionInputCard = ({ question, qIndex, onChange, onDelete, isDeletable }) => {

  // Helper function to trigger updates to the parent
  // It creates a new question object with the provided updates and passes it up.
  const triggerUpdate = (updates) => {
    onChange({ ...question, ...updates });
  };

  // Handle changing the question type and reset relevant fields
  const handleQuestionTypeChange = (type) => {
    let newOptions;
    let newAnswers = [];

    if (type === 'multiple_choice' || type === 'multiple_choose') {
      newOptions = ['', '', '', '']; // Always reset options for these types
    } else if (type === 'blank') {
      newOptions = []; // No options for blank
      newAnswers = ['']; // Single blank answer, default empty string
    } else if (type === 'true_false') {
      newOptions = ['true', 'false']; // Fixed options for true/false
      newAnswers = []; // Clear answers
    }
    // Trigger a single update with all changed properties
    triggerUpdate({ type, options: newOptions, answers: newAnswers });
  };

  // Handle changes to individual options for multiple choice/choose
  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    triggerUpdate({ options: newOptions });
  };

  // Handle changes to correct answers based on question type
  const handleAnswerChange = (e, optionValue) => {
    let newAnswers;
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      newAnswers = [optionValue];
    } else if (question.type === 'multiple_choose') {
      if (e.target.checked) {
        newAnswers = [...(question.answers || []), optionValue];
      } else {
        newAnswers = (question.answers || []).filter(ans => ans !== optionValue);
      }
    } else if (question.type === 'blank') {
      newAnswers = [e.target.value];
    }
    triggerUpdate({ answers: newAnswers });
  };

  // Render options input section for multiple choice/choose
  const renderOptionsInput = () => {
    if (question.type === 'multiple_choice' || question.type === 'multiple_choose') {
      const currentOptions = question.options || ['', '', '', ''];

      return (
        <div className="mt-4">
          <p className="block text-gray-700 text-sm font-bold mb-2">
            Enter choices here {question.type === 'multiple_choose' && '(Check the box(es) of the correct answer(s))'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {currentOptions.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <input
                  type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                  id={`q${qIndex}-opt${optIndex}`}
                  name={`q${qIndex}-answer`}
                  value={option}
                  checked={(question.answers || []).includes(option)}
                  onChange={(e) => handleAnswerChange(e, option)}
                  className={`${question.type === 'multiple_choice' ? 'form-radio' : 'form-checkbox'} text-blue-600`}
                />
                <input
                  type="text"
                  className="ml-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={option}
                  onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                  required
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render input for blank type question
  const renderBlankInput = () => {
    if (question.type === 'blank') {
      return (
        <div className="mt-4">
          <label htmlFor={`q${qIndex}-blank-answer`} className="block text-gray-700 text-sm font-bold mb-1">Correct Answer for Blank:</label>
          <input
            type="text"
            id={`q${qIndex}-blank-answer`}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={question.answers[0] || ''}
            onChange={(e) => handleAnswerChange(e, e.target.value)}
            placeholder="Enter the correct answer"
            required
          />
        </div>
      );
    }
    return null;
  };

  // Render True/False options
  const renderTrueFalseInput = () => {
    if (question.type === 'true_false') {
      return (
        <div className="mt-4">
          <span className="block text-gray-700 text-sm font-bold mb-1">Correct Answer:</span>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name={`q${qIndex}-tf-answer`}
                value="true"
                checked={(question.answers || []).includes('true')}
                onChange={(e) => handleAnswerChange(e, 'true')}
              />
              <span className="ml-2 text-gray-700">True</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name={`q${qIndex}-tf-answer`}
                value="false"
                checked={(question.answers || []).includes('false')}
                onChange={(e) => handleAnswerChange(e, 'false')}
              />
              <span className="ml-2 text-gray-700">False</span>
            </label>
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <h5 className="font-semibold text-md text-gray-800 mb-3">Question {qIndex + 1}</h5>

      <div className="mb-3">
        <span className="block text-gray-700 text-sm font-bold mb-1">Question Type:</span>
        <div className="flex flex-wrap items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`qType-${question.qId}`}
              value="multiple_choice"
              checked={question.type === 'multiple_choice'}
              onChange={() => handleQuestionTypeChange('multiple_choice')}
            />
            <span className="ml-2 text-gray-700">Multiple choice</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`qType-${question.qId}`}
              value="multiple_choose"
              checked={question.type === 'multiple_choose'}
              onChange={() => handleQuestionTypeChange('multiple_choose')}
            />
            <span className="ml-2 text-gray-700">Multiple choose</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`qType-${question.qId}`}
              value="blank"
              checked={question.type === 'blank'}
              onChange={() => handleQuestionTypeChange('blank')}
            />
            <span className="ml-2 text-gray-700">Blank</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name={`qType-${question.qId}`}
              value="true_false"
              checked={question.type === 'true_false'}
              onChange={() => handleQuestionTypeChange('true_false')}
            />
            <span className="ml-2 text-gray-700">True or false</span>
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor={`qText-${qIndex}`} className="block text-gray-700 text-sm font-bold mb-1">Enter question here...</label>
        {question.type === 'blank' && (
          <p className="text-xs text-gray-500 mb-1">(Use _____ (5 underscores) to represent blank in Blank type question)</p>
        )}
        <textarea
          id={`qText-${qIndex}`}
          rows="3"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={question.question || ''}
          onChange={(e) => triggerUpdate({ question: e.target.value })} // Direct update for question text
          placeholder="Enter question text"
          required
        ></textarea>
      </div>

      {renderOptionsInput()}
      {renderBlankInput()}
      {renderTrueFalseInput()}

      {isDeletable && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => onDelete(question.qId)}
            className="text-red-500 hover:text-red-700 text-sm font-bold"
          >
            Delete Question
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionInputCard;
