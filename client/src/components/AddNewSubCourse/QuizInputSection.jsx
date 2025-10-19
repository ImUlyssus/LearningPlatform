// src/AddNewSubCourse/QuizInputSection.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback, though not strictly necessary for this file
import QuestionInputCard from './QuestionInputCard';

const MAX_QUESTIONS = 20;

const QuizInputSection = ({ qaData, minScoreToPass, onQuizDataChange }) => {
  const [currentQaData, setCurrentQaData] = useState(qaData);
  const [currentMinScoreToPass, setCurrentMinScoreToPass] = useState(minScoreToPass);
  const [minScoreError, setMinScoreError] = useState('');

  const validateMinScore = (score, totalQuestions) => {
    if (score > totalQuestions) {
      setMinScoreError(`Min points to pass cannot exceed total questions (${totalQuestions}).`);
    } else {
      setMinScoreError('');
    }
  };

  useEffect(() => {
    if (qaData !== currentQaData) {
      setCurrentQaData(qaData);
    }
  }, [qaData, currentQaData]);

  useEffect(() => {
    if (minScoreToPass !== currentMinScoreToPass) {
      setCurrentMinScoreToPass(minScoreToPass);
    }
  }, [minScoreToPass, currentMinScoreToPass]);

  useEffect(() => {
    validateMinScore(currentMinScoreToPass, currentQaData.length);
  }, [currentMinScoreToPass, currentQaData.length, validateMinScore]);

  const handleMinScoreChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setCurrentMinScoreToPass(value);
    onQuizDataChange('min_score_to_pass', value);
  };

  // NEW: handleQuestionChange now accepts the entire updated question object
  const handleQuestionChange = useCallback((updatedQuestion) => { // Use useCallback for this function
    setCurrentQaData(prevQaData => {
      const newQaData = prevQaData.map(q =>
        q.qId === updatedQuestion.qId ? updatedQuestion : q
      );
      onQuizDataChange('qa_data', newQaData); // Propagate to grandparent
      return newQaData; // Update local state
    });
  }, [onQuizDataChange]);


  const isQuestionComplete = (question) => {
    if (!question || question.question.trim() === '') {
      return false;
    }
    switch (question.type) {
      case 'multiple_choice':
      case 'multiple_choose':
        const allOptionsFilled = (question.options || []).every(opt => opt.trim() !== '');
        const hasAnswer = (question.answers || []).length > 0;
        return allOptionsFilled && hasAnswer;
      case 'blank':
        return (question.answers || []).length > 0 && question.answers[0].trim() !== '';
      case 'true_false':
        return (question.answers || []).length === 1 && (question.answers[0] === 'true' || question.answers[0] === 'false');
      default:
        return false;
    }
  };

  const handleAddQuestion = () => {
    if (currentQaData.length > 0 && !isQuestionComplete(currentQaData[currentQaData.length - 1])) {
      alert('Please complete the current question before adding a new one.');
      return;
    }

    if (currentQaData.length < MAX_QUESTIONS) {
      const newQuestion = {
        qId: `q${Date.now()}`,
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        answers: [],
      };
      // When adding, directly update the state and propagate
      setCurrentQaData(prev => {
        const updated = [...prev, newQuestion];
        onQuizDataChange('qa_data', updated);
        return updated;
      });
    } else {
      alert(`You can add a maximum of ${MAX_QUESTIONS} questions.`);
    }
  };

  const handleDeleteQuestion = useCallback((qId) => { // Use useCallback for this function
    setCurrentQaData(prevQaData => {
      const updated = prevQaData.filter(q => q.qId !== qId);
      onQuizDataChange('qa_data', updated); // Propagate to grandparent
      return updated; // Update local state
    });
  }, [onQuizDataChange]);


  const disableAddQuestion = currentQaData.length >= MAX_QUESTIONS || (currentQaData.length > 0 && !isQuestionComplete(currentQaData[currentQaData.length - 1]));

  return (
    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white relative">
      <h4 className="text-md font-semibold text-gray-700 mb-4">Quiz Questions (Up to 20 QA pairs)</h4>

      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleAddQuestion}
          disabled={disableAddQuestion}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl transition-colors
            ${disableAddQuestion ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 shadow-lg'}`}
          title={disableAddQuestion ? "Complete current question or max questions reached" : "Add Question"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>

      {currentQaData.map((question, qIndex) => (
        <QuestionInputCard
          key={question.qId}
          question={question}
          qIndex={qIndex}
          // NEW: Pass the updated question object directly to handleQuestionChange
          onChange={handleQuestionChange}
          onDelete={handleDeleteQuestion}
          isDeletable={currentQaData.length > 1}
        />
      ))}

      {currentQaData.length === 0 && (
          <p className="text-gray-500 text-center py-4">Click the '+' button to add your first question.</p>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <label htmlFor="minPointsToPass" className="block text-gray-700 text-sm font-bold mb-1">Min points to pass:</label>
        <p className="text-xs text-gray-500 mb-2">(Each question counts 1 point)</p>
        <input
          type="number"
          id="minPointsToPass"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${minScoreError ? 'border-red-500' : ''}`}
          value={currentMinScoreToPass}
          onChange={handleMinScoreChange}
          required
          min="0"
          max={currentQaData.length}
        />
        {minScoreError && <p className="text-red-500 text-xs italic mt-1">{minScoreError}</p>}
      </div>
    </div>
  );
};

export default QuizInputSection;
