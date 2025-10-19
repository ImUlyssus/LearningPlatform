require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
// const bodyParser = require('body-parser');
const db = require('./models');
const PORT = process.env.PORT || 3001;
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
app.use(
  cors({
    origin: ["http://localhost:5173", "https://www.websitename.com"],
    credentials: true,
  })
);

// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// --- CRITICAL CHANGE: Serve static files unconditionally from 'uploads' directory ---
// This ensures files are served from the local disk in both development and production.
const LOCAL_UPLOAD_BASE_DIR = path.join(__dirname, 'uploads');
app.use('/api/uploads', express.static(LOCAL_UPLOAD_BASE_DIR));

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes); // All auth routes will be prefixed with /api


const userRoutes = require('./routes/userRoutes');
app.use('/api/user', authMiddleware, userRoutes);

const promotionRoutes = require('./routes/promotionRoutes');
app.use('/api/promotions', promotionRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

const lecturerRoutes = require('./routes/lecturerRoutes');
app.use('/api/lecturers', lecturerRoutes);

const subCourseRoutes = require('./routes/subCourseRoutes');
app.use('/api/sub-courses', subCourseRoutes);

const enrolledCoursesRoutes = require('./routes/enrolledCoursesRoutes');
app.use('/api/enrolled-courses', enrolledCoursesRoutes);

const lecturerMapRoutes = require('./routes/lecturerMapRoutes');
app.use('/api/lecturermaps', lecturerMapRoutes);

const moduleRoutes = require('./routes/moduleRoutes');
app.use('/api/modules', moduleRoutes);

const lectureRoutes = require('./routes/lectureRoutes');
app.use('/api/lectures', lectureRoutes);

const savedCoursesRoutes = require('./routes/savedCoursesRoutes');
app.use('/api/saved-courses', savedCoursesRoutes);

const certificateRoutes = require('./routes/certificateRoutes');
app.use('/api/certificates', certificateRoutes);

const fileRoutes = require('./routes/fileRoutes');
app.use('/api/files', fileRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

const emailRoutes = require('./routes/emailRoutes');
app.use('/api/email', emailRoutes);

db.sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log('Server is running on http://localhost:3001');
        }
        );
    })
    .catch((error) => {
        console.error('Error synchronizing database:', error);
    });