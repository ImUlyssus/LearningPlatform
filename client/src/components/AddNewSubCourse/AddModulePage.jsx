// src/pages/AddModulePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

import LectureInputCard from './LectureInputCard';
import { createModule, updateModule, getModuleById } from '../../services/moduleService';
import { createLecture, updateLecture, deleteLecture, deleteAllLecturesByModule } from '../../services/lectureService';


const AddModulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { moduleId: initialModuleId, subCourseId, isEditing, subCourseInfo } = location.state || {};

  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDuration, setModuleDuration] = useState(0);
  const [currentModuleId, setCurrentModuleId] = useState(initialModuleId);

  const [lectures, setLectures] = useState([]);
  const [originalLectures, setOriginalLectures] = useState([]);
  const [isEditingModule, setIsEditingModule] = useState(isEditing || false);

  const isInitialAddSetupDone = useRef(false);

  useEffect(() => {
    const fetchModuleData = async () => {
      if (isEditingModule && currentModuleId) {
        try {
          const response = await getModuleById(currentModuleId);
          const fetchedModule = response.data;
          setModuleTitle(fetchedModule.title);
          setModuleDuration(fetchedModule.duration);

          // Ensure _tempKey is used consistently
          const loadedLectures = fetchedModule.Lectures.map(lec => ({
            ...lec,
            _tempKey: lec.id || Math.random().toString(36).substring(7)
          }));
          setLectures(loadedLectures);
          setOriginalLectures(loadedLectures);
        } catch (err) {
          console.error('Error fetching module for editing:', err);
          toast.error('Failed to load module data for editing.');
          navigate(-1);
        }
      } else if (!isEditingModule && !isInitialAddSetupDone.current) {
        if (!subCourseId) {
          toast.error('Missing sub-course information. Cannot add new module.');
          navigate(-1);
          return;
        }
        // Ensure _tempKey is used consistently
        setLectures([{ id: '', title: '', type: 'video', link: '', slides: '', duration: 0, _tempKey: Math.random().toString(36).substring(7) }]);
        setOriginalLectures([]);
        isInitialAddSetupDone.current = true;
      }
    };

    fetchModuleData();
  }, [currentModuleId, isEditingModule, subCourseId, navigate]);

  const isLectureComplete = (lecture) => {
    // Updated validation for quiz type lectures
    if (lecture.type === 'quiz') {
      return lecture.title.trim() !== '' &&
             lecture.duration >= 0 &&
             (lecture.qa_data && lecture.qa_data.length > 0) &&
             (lecture.min_score_to_pass !== undefined && lecture.min_score_to_pass >= 0);
    } else {
      return lecture.title.trim() !== '' &&
             lecture.type !== '' &&
             lecture.duration >= 0;
    }
  };

  const handleAddLecture = () => {
    const lastLecture = lectures[lectures.length - 1];
    if (lectures.length > 0 && !isLectureComplete(lastLecture)) {
      toast.error('Please complete all fields for the current lecture before adding a new one.');
      return;
    }
    // Ensure _tempKey is used consistently
    setLectures([...lectures, { id: '', title: '', type: 'video', link: '', slides: '', duration: 0, _tempKey: Math.random().toString(36).substring(7) }]);
  };

  const handleLectureChange = useCallback((tempKey, field, value) => {
    setLectures(prevLectures => {
      const updatedLectures = prevLectures.map(lecture => {
        let updatedLec = lecture._tempKey === tempKey ? { ...lecture, [field]: value } : lecture;

        // Special handling for type change to 'quiz' - ensure this logic is included
        if (lecture._tempKey === tempKey) { // Only apply if this is the lecture being updated
          if (field === 'type' && value === 'quiz') {
              updatedLec.qa_data = updatedLec.qa_data || [];
              updatedLec.min_score_to_pass = updatedLec.min_score_to_pass || 0;
              updatedLec.link = '';
              updatedLec.slides = '';
          } else if (field === 'type' && (value === 'video' || value === 'reading')) {
              // Clear quiz-specific data if changing away from quiz
              delete updatedLec.qa_data;
              delete updatedLec.min_score_to_pass;
          }
        }
        return updatedLec;
      });

      const totalDuration = updatedLectures.reduce((sum, lecture) => sum + (Number(lecture.duration) || 0), 0);
      setModuleDuration(totalDuration);
      return updatedLectures;
    });
  }, [setLectures, setModuleDuration]);


  const handleDeleteLecture = async (tempKeyToDelete) => {
    if (lectures.length <= 1) {
      toast.error('A module must have at least one lecture.');
      return;
    }

    const lectureToDelete = lectures.find(lec => lec._tempKey === tempKeyToDelete);

    if (lectureToDelete && lectureToDelete.id) { // Only delete from backend if it has an actual ID
      try {
        await toast.promise(
          deleteLecture(lectureToDelete.id),
          {
            loading: 'Deleting lecture from backend...',
            success: 'Lecture deleted from backend!',
            error: 'Failed to delete lecture from backend.'
          }
        );
      } catch (error) {
        console.error('Error deleting lecture:', error);
        toast.error(error.response?.data?.message || 'Failed to delete lecture.');
        return; // Prevent UI removal if backend deletion fails
      }
    }

    setLectures(prevLectures => {
      const updatedLectures = prevLectures.filter(lec => lec._tempKey !== tempKeyToDelete);
      const totalDuration = updatedLectures.reduce((sum, lecture) => sum + (Number(lecture.duration) || 0), 0);
      setModuleDuration(totalDuration);
      return updatedLectures;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!moduleTitle.trim()) {
      toast.error('Module title cannot be empty.');
      return;
    }

    for (let i = 0; i < lectures.length; i++) {
      if (!isLectureComplete(lectures[i])) {
        toast.error(`Please complete all required fields for Lecture ${i + 1}.`);
        return;
      }
    }

    let moduleRes;
    try {
      const moduleData = {
        title: moduleTitle,
        duration: moduleDuration,
      };

      if (isEditingModule) {
        moduleRes = await toast.promise(
          updateModule(currentModuleId, moduleData),
          {
            loading: 'Updating module...',
            success: 'Module updated successfully!',
            error: 'Failed to update module.'
          }
        );
      } else {
        moduleRes = await toast.promise(
          createModule({ ...moduleData,id: currentModuleId }),
          {
            loading: 'Creating module...',
            success: 'Module created successfully!',
            error: 'Failed to create module.'
          }
        );
        // setCurrentModuleId(moduleRes.module.id); // This line might not be needed if currentModuleId is already set
        setIsEditingModule(true);
      }

      const parentModuleId = moduleRes.module?.id || currentModuleId;

      // --- Lecture Reconciliation: Delete All Existing, Then Re-Create All ---
      const lecturePromises = [];

      // 1. Delete ALL lectures associated with this module from the backend
      await toast.promise(
        deleteAllLecturesByModule(parentModuleId),
        {
          loading: 'Clearing old lectures...',
          success: 'Old lectures cleared!',
          error: 'Failed to clear old lectures.'
        }
      );

      // 2. Create ALL lectures based on the current UI state, with re-indexed IDs
      for (const [index, lecture] of lectures.entries()) {
          // Generate new, sequential ID for each lecture
          const newLectureId = `${parentModuleId}-${String(index + 1).padStart(2, '0')}`;
          const lectureToSave = {
            id: newLectureId,
            title: lecture.title,
            type: lecture.type,
            duration: lecture.duration,
            moduleId: parentModuleId,
            // Conditionally include link/slides or qa_data/min_score_to_pass
            ...(lecture.type !== 'quiz' ? { link: lecture.link, slides: lecture.slides } : {}),
            ...(lecture.type === 'quiz' ? { qa_data: lecture.qa_data, min_score_to_pass: lecture.min_score_to_pass } : {}),
          };

          lecturePromises.push(
              toast.promise(
                  createLecture(lectureToSave),
                  {
                      loading: `Adding lecture "${lecture.title}"...`,
                      success: `Lecture "${lecture.title}" added!`,
                      error: `Failed to add lecture "${lecture.title}".`
                  }
              )
          );
      }


      await Promise.all(lecturePromises); // Wait for all new lectures to be created

      toast.success('Module and lectures saved successfully!');
      navigate(`/manage-course`);
    } catch (error) {
      console.error('Error saving module and lectures:', error);
      toast.error(error.response?.data?.message || 'Failed to save module and lectures.');
    }
  };

  const handleBack = () => {
    navigate(-1);
    // navigate(`/manage-course/add-sub-course`, { replace:true, state: { courseInfo: subCourseInfo } });
  };
  const hasExistingQuizLecture = lectures.some(lec => lec.type === 'quiz');

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {isEditingModule ? 'Edit Module' : 'Add New Module'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-4xl mx-auto">
        <div className="mb-6">
          <label htmlFor="moduleTitle" className="block text-gray-700 text-sm font-bold mb-2">Module title:</label>
          <input
            type="text"
            id="moduleTitle"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            required
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Lectures</h2>

        <div className="space-y-4 mb-6">
          {lectures.map((lecture, index) => (
            <LectureInputCard
              key={lecture._tempKey} // Corrected: Use _tempKey for the key prop
              lecture={lecture}
              index={index}
              onChange={(field, value) => handleLectureChange(lecture._tempKey, field, value)} // Corrected: Pass _tempKey
              onDelete={() => handleDeleteLecture(lecture._tempKey)} // Corrected: Pass _tempKey
              isDeletable={index > 0}
              hasExistingQuizLecture={hasExistingQuizLecture}
            />
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={handleAddLecture}
            disabled={lectures.length > 0 && !isLectureComplete(lectures[lectures.length - 1])}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-4xl transition-colors
              ${(lectures.length === 0 || (lectures.length > 0 && isLectureComplete(lectures[lectures.length - 1]))) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Save Module
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddModulePage;
