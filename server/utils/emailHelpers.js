// utils/emailHelpers.js
// This function is used to send certificate in enrolledCourseController file
const { sendEmail } = require('./emailSender'); // Assuming emailSender is in the same 'utils' directory
const { User, Course, Sub_Course } = require('../models'); // Assuming User, Course, and Sub_Course models are accessible via '../models'
const { WEBSITE_NAME } = require('./constants'); // Assuming constants is in the same 'utils' directory
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

/**
 * Sends a course completion email notification to the user.
 * @param {string} userId - The ID of the user who completed the course.
 * @param {string} courseId - The ID of the completed course (can be a sub-course or main course ID).
 * @param {string} certificateId - The ID of the newly generated certificate.
 */
async function sendCourseCompletionEmailNotification(userId, courseId, certificateId) {
    try {
        // Fetch user details
        const user = await User.findByPk(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found for email notification.`);
            return;
        }

        const userEmail = user.email;
        const userName = user.username; // Assuming 'name' or 'firstName' field exists in User model

        // Determine if it's a sub-course or main course and fetch details
        let courseDetails;
        // First, try to find it as a Sub_Course
        courseDetails = await Sub_Course.findByPk(courseId);
        if (!courseDetails) {
            // If not a Sub_Course, try to find it as a main Course
            courseDetails = await Course.findByPk(courseId);
        }

        if (!courseDetails) {
            console.error(`Course or Sub_Course with ID ${courseId} not found for email notification.`);
            return;
        }

        const courseName = courseDetails.title;
        const certificateLink = `${config.frontend_url}/verify/${certificateId}?refresh=true`;
        // IMPORTANT: The surveyLink is a placeholder. You may want to make this dynamic or configurable.
        const surveyLink = `${config.frontend_url}/survey/${certificateId}`; 

        const subject = `Congratulations on Completing ${courseName}!`;
        const html = `
            <p>Dear ${userName},</p>
            <p>Congratulations on successfully completing the course: <strong>${courseName}</strong>!</p>
            <p>We are incredibly proud of your achievement.</p>
            <p>You can view and download your certificate here: <a href="${certificateLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">View Certificate</a></p>
            <p>We would also appreciate it if you could take a few moments to provide feedback on the course:</p>
            <p><a href="${surveyLink}" style="display: inline-block; padding: 10px 20px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 5px;">Take Course Survey</a></p>
            <p>Keep learning and growing!</p>
            <p>Best regards,</p>
            <p>The ${WEBSITE_NAME} Team</p>
        `;
        const text = `Dear ${userName},\n\nCongratulations on successfully completing the course: ${courseName}!\n\nYou can view and download your certificate here: ${certificateLink}\n\nWe would also appreciate it if you could take a few moments to provide feedback on the course: ${surveyLink}\n\nKeep learning and growing!\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

        await sendEmail(userEmail, subject, html, text);
        console.log(`Course completion email sent for user ${userName} (${userEmail}) for course ${courseName}. Certificate ID: ${certificateId}`);

    } catch (error) {
        console.error('Error sending course completion email notification:', error.message);
        // Do not re-throw here, as email sending should not block the main process.
    }
}
/**
 * Sends an enrollment confirmation email to the user for newly enrolled courses.
 * @param {string} userId - The ID of the user who enrolled.
 * @param {string[]} newlyEnrolledCourseIds - An array of IDs of the courses/sub-courses the user newly enrolled in.
 */
async function sendEnrollmentEmailNotification(userId, newlyEnrolledCourseIds) {
    if (!newlyEnrolledCourseIds || newlyEnrolledCourseIds.length === 0) {
        return; // No courses to send enrollment email for
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found for enrollment email notification.`);
            return;
        }

        const userEmail = user.email;
        const userName = user.username;

        let enrolledCourseInfo = []; // Array to store { name, link } for each course
        const frontendBaseUrl = config.frontend_url;

        for (const courseId of newlyEnrolledCourseIds) {
            let courseDetails = null;
            let courseLink = null;
            const hyphenCount = (courseId.match(/-/g) || []).length;

            if (hyphenCount === 3) { // It's a sub-course (e.g., AML-0000-001-01)
                courseDetails = await Sub_Course.findByPk(courseId);
                if (courseDetails && frontendBaseUrl) {
                    courseLink = `${frontendBaseUrl}/sub-course/${courseId}?refresh=true`;
                }
            } else if (hyphenCount === 2) { // It's a main course (e.g., AML-0000-001)
                courseDetails = await Course.findByPk(courseId);
                if (courseDetails && frontendBaseUrl) {
                    courseLink = `${frontendBaseUrl}/course-detail/${courseId}?refresh=true`;
                }
            } else {
                console.warn(`Unexpected course_id format for enrollment email: ${courseId}. Skipping.`);
            }

            if (courseDetails && courseLink) {
                enrolledCourseInfo.push({
                    name: courseDetails.title, // Assuming 'title' field exists in Course/Sub_Course models
                    link: courseLink
                });
            } else if (!courseDetails) {
                console.warn(`Course or Sub_Course with ID ${courseId} not found for enrollment email. Skipping.`);
            }
        }

        // If no valid course info was found, don't send email
        if (enrolledCourseInfo.length === 0) {
            console.warn(`No valid course information found for enrollment email to user ${userId}. Email not sent.`);
            return;
        }

        const subject = `Welcome to Your New Course${enrolledCourseInfo.length > 1 ? 's' : ''} at ${WEBSITE_NAME}!`;

        // Generate HTML list of courses with direct links
        const courseListHtml = enrolledCourseInfo.map(info =>
            `<li><a href="${info.link}" style="color: #007bff; text-decoration: none;"><strong>${info.name}</strong></a></li>`
        ).join('');

        // Generate plain text list of courses with direct links
        const courseListText = enrolledCourseInfo.map(info =>
            `- ${info.name}: ${info.link}`
        ).join('\n');

        const html = `
            <p>Dear ${userName},</p>
            <p>Congratulations! You have successfully enrolled in the following course${enrolledCourseInfo.length > 1 ? 's' : ''}:</p>
            <ul>
                ${courseListHtml}
            </ul>
            <p>Click on the course names above to go directly to your enrolled courses and start learning!</p>
            <p>We're excited to have you on board. Happy learning!</p>
            <p>Best regards,</p>
            <p>The ${WEBSITE_NAME} Team</p>
        `;

        const text = `Dear ${userName},\n\nCongratulations! You have successfully enrolled in the following course${enrolledCourseInfo.length > 1 ? 's' : ''}:\n\n${courseListText}\n\nWe're excited to have you on board. Happy learning!\n\nBest regards,\nThe ${WEBSITE_NAME} Team`;

        await sendEmail(userEmail, subject, html, text);
        console.log(`Enrollment email sent for user ${userName} (${userEmail}) for courses: ${enrolledCourseInfo.map(info => info.name).join(', ')}`);

    } catch (error) {
        console.error('Error sending enrollment email notification:', error.message);
        // Do not re-throw here, as email sending should not block the main process.
    }
}

module.exports = {
    sendCourseCompletionEmailNotification,
    sendEnrollmentEmailNotification
};
