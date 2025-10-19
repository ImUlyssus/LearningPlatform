// controllers/enrolledCoursesController.js
const { Enrolled_Courses, Quizzes, Sub_Course, Certificates, Course, User } = require('../models');
const { Op } = require('sequelize');
const { ROLES } = require('../utils/constants');
const { sendCourseCompletionEmailNotification, sendEnrollmentEmailNotification } = require('../utils/emailHelpers');
const ADMIN_ROLE = ROLES.ADMIN;
const MANAGER_ROLE = ROLES.MANAGER;
const NORMAL_ROLE = ROLES.NORMAL;
/**
 * Helper function to enroll a single course, checking for duplicates.
 * Defined outside the controller object for easier access.
 * @param {string} userId - The ID of the user.
 * @param {string} courseId - The ID of the course/sub-course to enroll.
 * @param {number} discountValue - Discount value (optional).
 * @param {Array} quizzesInfo - Quizzes info (optional).
 * @returns {Promise<boolean>} True if newly enrolled, false if already enrolled.
 */
const _enrollSingleCourse = async (userId, courseId, discountValue = 0, quizzesInfo = []) => {
  // Check if the user is already enrolled in this specific course_id
  const existingEnrollment = await Enrolled_Courses.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (existingEnrollment) {
    // console.log(`User ${userId} is already enrolled in ${courseId}. Skipping.`);
    return false; // Already enrolled
  }

  await Enrolled_Courses.create({
    user_id: userId,
    course_id: courseId,
    enrolled_date: new Date(),
    discount_value: discountValue,
    quizzes_info: quizzesInfo,
    completed: false
  });
  // console.log(`User ${userId} successfully enrolled in ${courseId}.`);
  return true; // Newly enrolled
};
// Helper to generate the next alphabetical certificate ID
// Helper to generate the next alphabetical certificate ID
const generateNextCertificateId = async () => {
  const lastCertificate = await Certificates.findOne({
    order: [['id', 'DESC']], // Get the certificate with the highest ID (alphabetically last)
    attributes: ['id'],
  });

  let lastId = 'aaaaaaaa'; // Default starting point in lowercase

  if (lastCertificate && lastCertificate.id) {
    const fetchedId = lastCertificate.id;
    // Validate if the fetched ID matches the expected 8-lowercase-letter format
    const idPattern = /^[a-z]{8}$/; // UPDATED: regex for lowercase
    if (idPattern.test(fetchedId)) {
      lastId = fetchedId;
    } else {
      console.warn(`Found malformed certificate ID '${fetchedId}'. Resetting ID generation to 'aaaaaaaa'.`);
      // If a malformed ID is found, we stick with 'aaaaaaaa' as the base
    }
  }

  if (lastId === 'zzzzzzzz') { // UPDATED: check for all 'z's
    // Handle overflow if all IDs are exhausted (highly unlikely but good practice)
    throw new Error('Certificate ID range exhausted.');
  }

  let nextId = '';
  let carry = 1; // Start with a carry of 1 to increment the last char

  for (let i = lastId.length - 1; i >= 0; i--) {
    let charCode = lastId.charCodeAt(i);
    if (carry > 0) {
      charCode++;
      // UPDATED: Check against 'z' and reset to 'a' for lowercase
      if (charCode > 'z'.charCodeAt(0)) { // Check if character goes past 'z'
        charCode = 'a'.charCodeAt(0); // Reset to 'a'
        carry = 1; // Carry over
      } else {
        carry = 0; // No carry needed
      }
    }
    nextId = String.fromCharCode(charCode) + nextId;
  }

  // This padding should now naturally result in 8 characters if the logic is correct
  // However, keeping it as a safeguard.
  while (nextId.length < 8) {
    nextId = 'a' + nextId; // UPDATED: pad with 'a'
  }

  return nextId.substring(0, 8); // Ensure it's exactly 8 characters
};

const deleteCertificateForCourse = async (userId, courseIdOrPattern) => {
    return await Certificates.destroy({
        where: {
            user_id: userId,
            course_id: courseIdOrPattern // This can be a string ID or an object like { [Op.like]: 'pattern' }
        }
    });
};

const EnrolledCoursesController = {
  /**
   * @route GET /api/enrolled-courses
   * @description Get all enrolled courses
   * @access Private (Admin, Manager)
   */
  getAllEnrolledCourses: async (req, res) => {
    try {
      const enrolledCourses = await Enrolled_Courses.findAll({
        order: [['enrolled_date', 'DESC']]
      });
      res.status(200).json({ enrolledCourses });
    } catch (error) {
      console.error('Error fetching all enrolled courses:', error.message);
      res.status(500).json({ message: 'Server error fetching all enrolled courses.', error: error.message });
    }
  },

  /**
   * @route GET /api/enrolled-courses/:id
   * @description Get a single enrolled course by its ID
   * @access Private (Admin, Manager, or the user themselves)
   */
  getEnrolledCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id; // Assuming user ID is available from authMiddleware
      const userRoles = req.user.roles; // Assuming user roles are available from authMiddleware

      const enrolledCourse = await Enrolled_Courses.findByPk(id);

      if (!enrolledCourse) {
        return res.status(404).json({ message: 'Enrolled course not found.' });
      }

      // Authorization check: User can only view their own enrollment unless they are Admin/Manager
      if (!userRoles.includes(ADMIN_ROLE) &&
          !userRoles.includes(MANAGER_ROLE) &&
          enrolledCourse.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access this enrollment.' });
      }

      res.status(200).json({ enrolledCourse });
    } catch (error) {
      console.error('Error fetching enrolled course by ID:', error.message);
      res.status(500).json({ message: 'Server error fetching enrolled course.', error: error.message });
    }
  },

  /**
   * @route GET /api/enrolled-courses/user/:userId
   * @description Get all courses a specific user is enrolled in
   * @access Private (Admin, Manager, or the user themselves)
   */
  getEnrolledCoursesByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.id; // Assuming user ID from authMiddleware
      const userRoles = req.user.roles; // Assuming user roles from authMiddleware

      // Authorization check: User can only view their own enrollments unless they are Admin/Manager
      if (!userRoles.includes(ADMIN_ROLE) &&
          !userRoles.includes(MANAGER_ROLE) &&
          parseInt(userId) !== requestingUserId) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to access these enrollments.' });
      }

      const enrolledCourses = await Enrolled_Courses.findAll({
        where: { user_id: userId },
        order: [['enrolled_date', 'DESC']]
      });
      res.status(200).json({ enrolledCourses });
    } catch (error) {
      console.error('Error fetching enrolled courses by user ID:', error.message);
      res.status(500).json({ message: 'Server error fetching enrolled courses for user.', error: error.message });
    }
  },

  /**
   * @route GET /api/enrolled-courses/course/:courseId
   * @description Get all users enrolled in a specific course
   * @access Private (Admin, Manager, Lecturer for their own courses)
   */
  getEnrolledCoursesByCourseId: async (req, res) => {
    try {
      const { courseId } = req.params;
      // Additional authorization logic might be needed here if a lecturer can only see enrollments for courses they teach.
      // For simplicity, assuming Admin/Manager/Lecturer can see all enrollments for a given course ID.

      const enrolledCourses = await Enrolled_Courses.findAll({
        where: { course_id: courseId },
        order: [['enrolled_date', 'DESC']]
      });
      res.status(200).json({ enrolledCourses });
    } catch (error) {
      console.error('Error fetching enrolled courses by course ID:', error.message);
      res.status(500).json({ message: 'Server error fetching enrolled courses for course.', error: error.message });
    }
  },

  /**
   * @route POST /api/enrolled-courses/
   * @description Enroll a user in a course or sub-course, handling bulk enrollment for main courses.
   * @access Private (Admin/Manager can enroll others, Normal users can only enroll themselves)
   */
  createEnrolledCourse: async (req, res) => {
    try {
      const { user_id, course_id, discount_value, quizzes_info } = req.body;
      const requestingUserId = req.user.id;
      const userRoles = req.user.roles;

      // If user is trying to enroll someone else, they must be Admin/Manager
      if (
        !userRoles.includes(ADMIN_ROLE) &&
        !userRoles.includes(MANAGER_ROLE) &&
        user_id !== requestingUserId
      ) {
        return res.status(403).json({ message: 'Forbidden: You can only enroll yourself unless you have administrative privileges.' });
      }

      // Determine if it's a main course or sub-course based on hyphens
      const hyphenCount = (course_id.match(/-/g) || []).length;

      let newlyEnrolledCourses = []; // To track all courses enrolled in this request

      if (hyphenCount === 3) { // It's a sub-course (e.g., AML-0000-001-01)
        const subCourseId = course_id;
        const mainCourseIdPrefix = subCourseId.substring(0, subCourseId.lastIndexOf('-')); // e.g., AML-0000-001

        const enrolled = await _enrollSingleCourse(
          user_id,
          subCourseId,
          discount_value,
          quizzes_info
        );
        if (enrolled) newlyEnrolledCourses.push(subCourseId);

        // Find all sub-courses associated with this main course prefix (XXX-0000-001-%)
        const allSiblingSubCourses = await Sub_Course.findAll({
          where: { id: { [Op.like]: `${mainCourseIdPrefix}-%` } },
          attributes: ['id']
        });
        const allSiblingSubCourseIds = allSiblingSubCourses.map(sc => sc.id).sort();

        // Find all sub-courses the user is ALREADY enrolled in under this main course prefix
        const enrolledSiblingSubCourses = await Enrolled_Courses.findAll({
          where: {
            user_id,
            course_id: { [Op.like]: `${mainCourseIdPrefix}-%` }
          },
          attributes: ['course_id']
        });
        const currentlyEnrolledSiblingSubCourseIds = enrolledSiblingSubCourses.map(esc => esc.course_id).sort();

        // Check if all siblings are now enrolled
        if (allSiblingSubCourseIds.length > 0 &&
            allSiblingSubCourseIds.length === currentlyEnrolledSiblingSubCourseIds.length &&
            JSON.stringify(allSiblingSubCourseIds) === JSON.stringify(currentlyEnrolledSiblingSubCourseIds)) {
          // If all sub-courses are enrolled, enroll the main course as well
          const mainCourseEnrolled = await _enrollSingleCourse(
            user_id,
            mainCourseIdPrefix, // The main course ID
            discount_value, // Apply discount to main course enrollment too
            [] // Main courses typically don't have quizzes_info directly
          );
          if (mainCourseEnrolled) newlyEnrolledCourses.push(mainCourseIdPrefix);
        }

      } else if (hyphenCount === 2) { // It's a main course (e.g., AML-0000-001)
        const mainCourseId = course_id;

        const enrolled = await _enrollSingleCourse(
          user_id,
          mainCourseId,
          discount_value,
          quizzes_info
        );
        if (enrolled) newlyEnrolledCourses.push(mainCourseId);

        // Find all associated sub-courses for this main course
        const associatedSubCourses = await Sub_Course.findAll({
          where: { id: { [Op.like]: `${mainCourseId}-%` } },
          attributes: ['id']
        });

        // Enroll all associated sub-courses
        for (const subCourse of associatedSubCourses) {
          const subEnrolled = await _enrollSingleCourse(
            user_id,
            subCourse.id,
            discount_value, // Apply main course's discount to sub-courses
            [] // Sub-courses might have specific quizzes_info if provided in a different call, but for bulk enrollment from main, we'll keep it empty.
          );
          if (subEnrolled) newlyEnrolledCourses.push(subCourse.id);
        }

      } else {
        return res.status(400).json({ message: 'Invalid course ID format. Must contain 2 or 3 hyphens.' });
      }

      if (newlyEnrolledCourses.length > 0) {
        // <--- NEW: Call the email notification helper for enrollment --->
        await sendEnrollmentEmailNotification(user_id, newlyEnrolledCourses);

        res.status(201).json({
          message: 'User successfully enrolled in course(s).',
          enrolledCourses: newlyEnrolledCourses
        });
      } else {
        // This case means the user was already enrolled in everything requested
        res.status(200).json({
          message: 'User was already enrolled in the specified course(s).',
          enrolledCourses: []
        });
      }

    } catch (error) {
      console.error('Error creating enrolled course:', error.message);
      res.status(500).json({ message: 'Server error enrolling user in course.', error: error.message });
    }
  },

  /**
   * @route PUT /api/enrolled-courses/:id
   * @description Updates an existing enrolled course entry
   * @access Private (Admin, Manager, or the user themselves)
   */
  updateEnrolledCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRoles = req.user.roles;

      const enrolledCourse = await Enrolled_Courses.findByPk(id);

      if (!enrolledCourse) {
        return res.status(404).json({ message: 'Enrolled course not found.' });
      }

      // Authorization check: User can only update their own enrollment unless they are Admin/Manager
      if (!userRoles.includes(ADMIN_ROLE) &&
          !userRoles.includes(MANAGER_ROLE) &&
          enrolledCourse.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to update this enrollment.' });
      }

      // Prevent users from changing user_id or course_id via update
      if (updateData.user_id || updateData.course_id) {
          return res.status(400).json({ message: 'Cannot change user_id or course_id after enrollment.' });
      }

      await enrolledCourse.update(updateData);

      res.status(200).json({ message: 'Enrolled course updated successfully.', enrolledCourse });
    } catch (error) {
      console.error('Error updating enrolled course:', error.message);
      res.status(500).json({ message: 'Server error updating enrolled course.', error: error.message });
    }
  },

  /**
   * @route PUT /api/enrolled-courses/:id/complete
   * @description Marks an enrolled course as completed
   * @access Private (Admin, Manager, or the user themselves)
   */
  markCourseAsCompleted: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRoles = req.user.roles;

      const enrolledCourse = await Enrolled_Courses.findByPk(id);

      if (!enrolledCourse) {
        return res.status(404).json({ message: 'Enrolled course not found.' });
      }

      // Authorization check: User can only mark their own enrollment as complete unless they are Admin/Manager
      if (!userRoles.includes(ADMIN_ROLE) &&
          !userRoles.includes(MANAGER_ROLE) &&
          enrolledCourse.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to mark this enrollment as complete.' });
      }

      if (enrolledCourse.completed) {
        return res.status(409).json({ message: 'Course is already marked as completed.' });
      }

      enrolledCourse.completed = true;
      await enrolledCourse.save();

      res.status(200).json({ message: 'Course marked as completed successfully!', enrolledCourse });
    } catch (error) {
      console.error('Error marking course as completed:', error.message);
      res.status(500).json({ message: 'Server error marking course as completed.', error: error.message });
    }
  },

  /**
   * @route DELETE /api/enrolled-courses/:id
   * @description Deletes an enrolled course entry (unenrolls a user)
   * @access Private (Admin, Manager)
   */
  deleteEnrolledCourse: async (req, res) => {
    try {
      const { id: enrollmentPrimaryKey } = req.params; // This is the primary key from the `enrolled_courses` table (e.g., 15)
      const { userId: targetUserId } = req.body; // This is the ID of the user whose enrollment is being deleted (e.g., 2)

      // 1. Find the specific enrolled course entry using its primary key (`enrollmentPrimaryKey`)
      // and ensure it belongs to the `targetUserId`.
      const enrolledCourseToDelete = await Enrolled_Courses.findOne({
        where: {
          id: enrollmentPrimaryKey, // Use the table's primary key 'id' column for this lookup
          user_id: targetUserId    // And the user_id to ensure ownership
        }
      });

      if (!enrolledCourseToDelete) {
        // Return 404 if the specific enrollment for that user and primary key combination is not found.
        return res.status(404).json({ message: 'Enrolled course not found for this user.' });
      }

      // Get the actual course_id string from the found record (e.g., 'CSC-0000-001-02')
      const actualCourseIdString = enrolledCourseToDelete.course_id;

      // 2. Delete the specific enrollment entry
      await enrolledCourseToDelete.destroy();
      // 2.1. Also delete the corresponding certificate for this specific course_id
      const deletedCertCount_primary = await deleteCertificateForCourse(targetUserId, actualCourseIdString);
      if (deletedCertCount_primary > 0) {
          console.log(`Deleted ${deletedCertCount_primary} certificate(s) for course ${actualCourseIdString} for user ${targetUserId}.`);
      }


      let message = 'Enrollment successfully removed.';

      // Determine if the `actualCourseIdString` is a sub-course ID by counting the hyphens
      const hyphenCount = actualCourseIdString.split('-').length - 1;
      const isSubCourseId = hyphenCount === 3; // True if it's a sub-course ID

      // Define a base where clause for bulk operations, always including the targetUserId
      const bulkDeleteWhereClause = { user_id: targetUserId };

      if (!isSubCourseId) {
        // Case: The `actualCourseIdString` was a main course ID (e.g., 'CSC-0000-001')
        // If a main course enrollment is removed, remove all its sub-course enrollments as well for this user.
        const deletedSubCoursesCount = await Enrolled_Courses.destroy({
          where: {
            course_id: { // <--- IMPORTANT: Use `course_id` column here for the LIKE operation
              [Op.like]: `${actualCourseIdString}-%` // Matches all sub-courses like 'CSC-0000-001-%'
            },
            ...bulkDeleteWhereClause // Apply the target user filter
          }
        });
        // Also delete certificates for these associated sub-courses
        const deletedCertCount_subCourses = await deleteCertificateForCourse(targetUserId, { [Op.like]: `${actualCourseIdString}-%` });
        if (deletedCertCount_subCourses > 0) {
            console.log(`Deleted ${deletedCertCount_subCourses} certificate(s) for sub-courses of ${actualCourseIdString} for user ${targetUserId}.`);
        }


        if (deletedSubCoursesCount > 0) {
          message += ` Also removed ${deletedSubCoursesCount} associated sub-course enrollments.`;
        }

      } else {
        // Case: The `actualCourseIdString` was a sub-course ID (e.g., 'CSC-0000-001-02')
        // Extract the main course ID string from the sub-course ID string
        const mainCourseId = actualCourseIdString.substring(0, actualCourseIdString.lastIndexOf('-')); // Gets 'CSC-0000-001'

        // Find the main course enrollment for this specific user (if it exists)
        const mainCourseEnrollment = await Enrolled_Courses.findOne({
          where: {
            course_id: mainCourseId, // <--- IMPORTANT: Use `course_id` column here
            ...bulkDeleteWhereClause // Apply the target user filter
          }
        });

        // If the main course itself is enrolled, remove that enrollment too for this user.
        if (mainCourseEnrollment) {
          await mainCourseEnrollment.destroy();
          // Also delete the corresponding main course certificate
          const deletedCertCount_mainCourse = await deleteCertificateForCourse(targetUserId, mainCourseId);
          if (deletedCertCount_mainCourse > 0) {
              console.log(`Deleted ${deletedCertCount_mainCourse} certificate(s) for main course ${mainCourseId} for user ${targetUserId}.`);
          }
          message += ` Also removed enrollment for main course "${mainCourseId}".`;
        }
      }

      res.status(200).json({ message });
    } catch (error) {
      console.error('Error deleting enrolled course:', error.message);
      res.status(500).json({ message: 'Server error deleting enrolled course.', error: error.message });
    }
  },
  /**
   * @route POST /api/enrolled-courses/quiz-info
   * @description Update a user's quiz information for a specific course.
   *              This function will append new quiz attempt data to the quizzes_info JSON array.
   * @access Private (User only - for their own progress)
   */
  updateQuizInfo: async (req, res) => {
    try {
      const { quizId, minScoreToPass, scoreReceived, courseId } = req.body;
      const userId = req.user.id; // User ID from authMiddleware
      const userRole = req.user.user_role; // Get user's role from authMiddleware

      // 1. Validate incoming data
      if (!quizId || minScoreToPass === undefined || scoreReceived === undefined || !courseId) {
        return res.status(400).json({ message: 'Missing required quiz progress data.' });
      }

      // 2. Find the enrolled course record for the user and course
      let enrolledCourse = await Enrolled_Courses.findOne({
        where: {
          user_id: userId,
          course_id: courseId,
        },
      });

      // --- MODIFIED LOGIC START ---
      if (!enrolledCourse) {
        if (userRole === NORMAL_ROLE) {
          // If user is a NORMAL_ROLE and not enrolled, they must enroll first
          return res.status(404).json({ message: 'Enrolled course not found for this user and course ID. Normal users must enroll first.' });
        } else {
          // For other roles (Admin, Manager, Lecturer), create a new enrollment
          console.log(`User ${userId} with role ${userRole} is not enrolled in ${courseId}. Creating new enrollment.`);
          enrolledCourse = await Enrolled_Courses.create({
            user_id: userId,
            course_id: courseId,
            enrolled_date: new Date(),
            discount_value: 0, // Default value for new enrollment
            quizzes_info: [], // Initialize empty quizzes_info
            completed: false, // Not completed yet
          });
        }
      }
      // --- MODIFIED LOGIC END ---

      // Calculate 'passed' status for the current attempt
      const isPassed = scoreReceived >= minScoreToPass;

      // Prepare the new quiz attempt entry
      const newQuizAttempt = {
        quizId: quizId,
        minScoreToPass: minScoreToPass,
        scoreReceived: scoreReceived,
        attemptDate: new Date().toISOString(),
        isPassed: isPassed, // Add the 'passed' attribute
      };

      // Ensure quizzes_info is an array, even if it's null or undefined
      let currentQuizzesInfo = Array.isArray(enrolledCourse.quizzes_info)
        ? [...enrolledCourse.quizzes_info]
        : [];

      // 2.1. Check if quizzes_info already has a value with incoming quizId
      const existingQuizIndex = currentQuizzesInfo.findIndex(
        (info) => info.quizId === quizId
      );

      if (existingQuizIndex !== -1) {
        // If incoming scoreReceived is larger than existing scoreReceived, replace
        if (scoreReceived > currentQuizzesInfo[existingQuizIndex].scoreReceived) {
          currentQuizzesInfo[existingQuizIndex] = newQuizAttempt;
        }
      } else {
        // If object with incoming quizId doesn't exist, simply push it
        currentQuizzesInfo.push(newQuizAttempt);
      }

      // Save the updated quizzes_info to the database
      await enrolledCourse.update({ quizzes_info: currentQuizzesInfo });

      // --- Task 2: Check (Sub)Course Completion and Certificates ---
      // This 'courseId' is specifically a sub-course ID (e.g., AML-0000-001-01)
      const allQuizzesForSubCourse = await Quizzes.findAll({
        where: {
          // Find all quizzes whose lecture_id starts with this sub-course ID
          lecture_id: { [Op.like]: `${courseId}-%` }
        },
        attributes: ['lecture_id'],
      });

      const requiredQuizIds = new Set(allQuizzesForSubCourse.map(q => q.lecture_id));
      const completedQuizIds = new Set(currentQuizzesInfo.map(q => q.quizId));

      let allQuizzesAttempted = true;
      let allQuizzesPassed = true;

      // Only proceed with completion check if there are required quizzes
      if (requiredQuizIds.size > 0) {
        for (const reqQuizId of requiredQuizIds) {
          if (!completedQuizIds.has(reqQuizId)) {
            allQuizzesAttempted = false;
            break;
          }
          const userAttempt = currentQuizzesInfo.find(q => q.quizId === reqQuizId);
          if (!userAttempt || !userAttempt.isPassed) {
            allQuizzesPassed = false;
            break;
          }
        }
      } else {
        // If no quizzes are defined for this sub-course, it cannot be completed via quiz submission.
        // This scenario might require manual completion or completion via other means.
        // For now, we set these to false to prevent accidental completion if no quizzes are present.
        allQuizzesAttempted = false;
        allQuizzesPassed = false;
      }


      // If all quizzes for this sub-course are attempted AND passed, mark the enrolledCourse as completed
      if (allQuizzesAttempted && allQuizzesPassed && !enrolledCourse.completed) {
        await enrolledCourse.update({ completed: true });

        // Insert into Certificates table for the sub-course
        const newCertificateId = await generateNextCertificateId();
        await Certificates.create({
          id: newCertificateId,
          user_id: userId,
          course_id: courseId, // This is the sub-course ID
          completed_date: new Date(),
          score: scoreReceived, // Use the score from the latest quiz that triggered completion
        });
        console.log(`Sub-Course ${courseId} completed and certificate ${newCertificateId} issued for user ${userId}.`);

        // <--- NEW: Call the email notification helper for sub-course completion --->
        await sendCourseCompletionEmailNotification(userId, courseId, newCertificateId);


        // --- Task 3: Check Main Course Completion and Certificates ---
        // Extract the main course ID from the sub-course ID
        const mainCourseId = courseId.substring(0, courseId.lastIndexOf('-')); // e.g., AML-0000-000

        // NEW: Check if this derived mainCourseId actually exists in the Course table
        const existingMainCourse = await Course.findByPk(mainCourseId);
        if (!existingMainCourse) {
          console.log(`Derived main course ID ${mainCourseId} does not exist in the Course table. Skipping main course completion check.`);
          return res.status(200).json({
            message: 'Quiz information updated successfully! Sub-course completed.',
            updatedQuizInfo: newQuizAttempt,
          });
        }

        // Get all sub-courses associated with this main course from Sub_Course table
        const allSubCoursesOfMain = await Sub_Course.findAll({
          where: {
            id: { [Op.like]: `${mainCourseId}-%` }
          },
          attributes: ['id'],
        });
        const requiredSubCourseIds = new Set(allSubCoursesOfMain.map(sc => sc.id));

        // Get all enrolled sub-courses for this user under this main course
        const enrolledSubCoursesForMain = await Enrolled_Courses.findAll({
          where: {
            user_id: userId,
            course_id: { [Op.like]: `${mainCourseId}-%` }
          },
          attributes: ['course_id', 'completed'],
        });

        const completedEnrolledSubCourseIds = new Set(
          enrolledSubCoursesForMain
            .filter(esc => esc.completed)
            .map(esc => esc.course_id)
        );

        let allSubCoursesEnrolledAndCompleted = true;
        // Check if all *required* sub-courses are marked as completed in Enrolled_Courses
        if (requiredSubCourseIds.size === 0) {
            // If the main course has no defined sub-courses, it can't be completed this way.
            // Or, if a main course is considered complete if it has no sub-courses,
            // this logic needs adjustment. For now, it won't be completed.
            allSubCoursesEnrolledAndCompleted = false;
        } else {
            for (const reqSubCourseId of requiredSubCourseIds) {
                if (!completedEnrolledSubCourseIds.has(reqSubCourseId)) {
                    allSubCoursesEnrolledAndCompleted = false;
                    break;
                }
            }
        }


        // If all sub-courses are enrolled and completed, update main course
        if (allSubCoursesEnrolledAndCompleted) {
          let mainEnrolledCourse = await Enrolled_Courses.findOne({
            where: {
              user_id: userId,
              course_id: mainCourseId,
            },
          });

          if (!mainEnrolledCourse) {
            // If main course enrollment doesn't exist, create it with default values and completed: true
            mainEnrolledCourse = await Enrolled_Courses.create({
              user_id: userId,
              course_id: mainCourseId,
              enrolled_date: new Date(),
              discount_value: 0, // Default value
              quizzes_info: [], // No quizzes_info for main course directly
              completed: true,
            });
          } else if (!mainEnrolledCourse.completed) {
            // If it exists but not completed, update to completed: true
            await mainEnrolledCourse.update({ completed: true });
          }

          // Check if a certificate already exists for the main course
          const existingMainCourseCertificate = await Certificates.findOne({
            where: {
              user_id: userId,
              course_id: mainCourseId
            }
          });

          if (!existingMainCourseCertificate) {
            // Insert into Certificates table for the main course
            const newMainCertId = await generateNextCertificateId();
            await Certificates.create({
              id: newMainCertId,
              user_id: userId,
              course_id: mainCourseId,
              completed_date: new Date(),
              score: 0, // Main course doesn't have a direct score, set to 0 or average sub-course scores
            });
            console.log(`Main Course ${mainCourseId} completed and certificate ${newMainCertId} issued for user ${userId}.`);

            // <--- NEW: Call the email notification helper for main course completion --->
            await sendCourseCompletionEmailNotification(userId, mainCourseId, newMainCertId);
          }
        }
      }

      res.status(200).json({
        message: 'Quiz information updated successfully!',
        updatedQuizInfo: newQuizAttempt,
      });

    } catch (error) {
      console.error('Error updating quiz information:', error.message);
      res.status(500).json({ message: 'Server error while updating quiz information.', error: error.message });
    }
  },


};

module.exports = EnrolledCoursesController;
