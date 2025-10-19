// controllers/FileController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra'); // Using fs-extra for promises-based file system operations
const mimeTypes = require('mime-types');

// --- Configuration (Local Storage Only) ---
const LOCAL_UPLOAD_BASE_DIR = path.join(__dirname, '..', 'uploads');
const COURSES_UPLOAD_DIR = path.join(LOCAL_UPLOAD_BASE_DIR, 'courses');
const USERS_UPLOAD_DIR = path.join(LOCAL_UPLOAD_BASE_DIR, 'users');
const LECTURERS_UPLOAD_DIR = path.join(LOCAL_UPLOAD_BASE_DIR, 'lecturers');
const DEFAULT_IMAGE_DIR = path.join(__dirname, '..', 'utils');
const DEFAULT_THUMBNAIL_PATH = path.join(DEFAULT_IMAGE_DIR, 'default-thumbnail.png');
const DEFAULT_USER_PATH = path.join(DEFAULT_IMAGE_DIR, 'default-profile.png');

fs.ensureDirSync(LOCAL_UPLOAD_BASE_DIR);
fs.ensureDirSync(COURSES_UPLOAD_DIR);
fs.ensureDirSync(DEFAULT_IMAGE_DIR);
fs.ensureDirSync(USERS_UPLOAD_DIR);     // <--- NEW
fs.ensureDirSync(LECTURERS_UPLOAD_DIR); 
console.log(`Local upload base directory ensured: ${LOCAL_UPLOAD_BASE_DIR}`);
console.log(`Courses upload directory ensured: ${COURSES_UPLOAD_DIR}`);

// Helper function to determine the general file type category based on MIME type
function getFileTypeCategory(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype === 'application/zip') return 'zip';
    if (mimetype.startsWith('audio/')) return 'audio'; // Include audio if you want to handle it specifically
    return null; // For other types or unhandled categories
}

// --- Multer Storage Strategy (Local Disk) ---
const storageStrategy = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            cb(null, COURSES_UPLOAD_DIR);
        } catch (error) {
            console.error('Error setting local storage destination:', error);
            cb(error, null);
        }
    },
    filename: async (req, file, cb) => {
        try {
            // Extract the base name (ID) of the file without its current extension
            // For example, if file.originalname is 'my-course-video.mp4', baseName will be 'my-course-video'
            const baseName = path.parse(file.originalname).name;
            const fileExtension = path.extname(file.originalname).toLowerCase(); // Convert extension to lowercase
        const finalFileName = `${baseName}${fileExtension}`;

            const fileCategory = getFileTypeCategory(file.mimetype);

            // If the incoming file is an image or video, we need to delete any existing file
            // that shares the same base name but might have a different extension within that category.
            if (fileCategory === 'image' || fileCategory === 'video') {
                const extensionsToDelete = FILE_TYPE_EXTENSIONS_MAP[fileCategory];

                // Iterate through all possible extensions for this category
                for (const ext of extensionsToDelete) {
                    const existingFilePath = path.join(COURSES_UPLOAD_DIR, `${baseName}${ext}`);
                    // Check if a file with the same base name and one of the target extensions exists
                    if (await fs.pathExists(existingFilePath)) {
                        await fs.remove(existingFilePath); // Delete the old file
                        console.log(`Removed existing ${fileCategory} file for base name '${baseName}': ${existingFilePath}`);
                    }
                }
            }
            // For other file types (like PDF, ZIP, or Audio), Multer's default diskStorage behavior
            // will automatically overwrite a file if one with the *exact same filename* exists.
            // If the base name is the same but the extension is different (e.g., uploading name.pdf when name.zip exists),
            // the new file will simply be added alongside the old one, which aligns with your requirement for these types.

            cb(null, finalFileName); // Multer will now proceed to write the new file
        } catch (error) {
            console.error('Error setting local storage filename:', error);
            cb(error, null);
        }
    }
});

const ALLOWED_COURSE_FILE_TYPES = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-flv',
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav',
    'application/zip',
];

const upload = multer({
    storage: storageStrategy,
    limits: { fileSize: 1000 * 1024 * 1024 }, // Increased limit to 1000MB for large videos
    fileFilter: (req, file, cb) => {
        if (ALLOWED_COURSE_FILE_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types for courses folder: ${ALLOWED_COURSE_FILE_TYPES.join(', ')}`), false);
        }
    }
}).single('file');

// --- NEW Multer Storage Strategy for User/Lecturer Images ---
const entityImageStorageStrategy = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Access entityType from req.params (available here because it's a URL param)
        const { entityType } = req.params; // <--- CHANGED: req.params instead of req.body
        let destinationPath;
        if (entityType === 'user') {
            destinationPath = USERS_UPLOAD_DIR;
        } else if (entityType === 'lecturer') {
            destinationPath = LECTURERS_UPLOAD_DIR;
        } else {
            // This case should ideally not be hit if route params are strict, but good for safety
            return cb(new Error('Invalid entityType provided in URL parameters.'), null);
        }
        await fs.ensureDir(destinationPath);
        cb(null, destinationPath);
    },
    filename: async (req, file, cb) => {
        // Access id and entityType from req.params
        const { id, entityType } = req.params; // <--- CHANGED: req.params instead of req.body
        const fileExtension = path.extname(file.originalname).toLowerCase();
        let targetDir;

        if (entityType === 'user') {
            targetDir = USERS_UPLOAD_DIR;
        } else if (entityType === 'lecturer') {
            targetDir = LECTURERS_UPLOAD_DIR;
        } else {
            return cb(new Error('Invalid entityType for filename processing in URL parameters.'), null);
        }

        // Delete any existing image for this ID, regardless of its extension
        const possibleImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']; // Common image formats
        for (const ext of possibleImageExtensions) {
            const existingFilePath = path.join(targetDir, `${id}${ext}`);
            if (await fs.pathExists(existingFilePath)) {
                await fs.remove(existingFilePath);
                console.log(`Removed existing image for ${entityType} ID ${id}: ${existingFilePath}`);
            }
        }

        const finalFileName = `${id}${fileExtension}`; // e.g., "1.jpg"
        cb(null, finalFileName);
    }
});

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const uploadEntityImageFile = multer({
    storage: entityImageStorageStrategy,
    limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit for profile images
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for entity image. Allowed types: ${ALLOWED_IMAGE_MIMETYPES.join(', ')}`), false);
        }
    }
}).single('file');

// --- Define allowed extensions for dynamic lookup based on general type ---
const FILE_TYPE_EXTENSIONS_MAP = {
    'video': ['.mp4', '.webm', '.ogg', '.mov', '.MOV', '.flv'], // Common video formats
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'], // Common image formats
    'pdf': ['.pdf'],
    'zip': ['.zip']
};


// --- Controller Methods ---
const fileController = {
    // This is the main upload endpoint, wrapped for error handling
    uploadFile: (req, res) => {
        upload(req, res, async (err) => { // Multer logic wrapped inside the handler as per your old working code
            if (err instanceof multer.MulterError) {
                console.error('Multer Error:', err.message);
                return res.status(400).json({ message: `File upload error: ${err.message}` });
            } else if (err) {
                console.error('General Upload Error:', err.message);
                return res.status(500).json({ message: `File upload failed: ${err.message}` });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file provided or file upload failed.' });
            }

            const relativePath = path.relative(LOCAL_UPLOAD_BASE_DIR, req.file.path);
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${relativePath.replace(/\\/g, '/')}`;

            res.status(200).json({
                message: 'File uploaded successfully',
                filePath: fileUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimetype: req.file.mimetype
            });
        });
    },

    deleteFile: async (req, res) => {
        try {
            const { fileName } = req.body;

            if (!fileName) {
                return res.status(400).json({ message: 'File name to delete is required.' });
            }

            const fullLocalPath = path.join(COURSES_UPLOAD_DIR, fileName);

            if (await fs.pathExists(fullLocalPath)) {
                await fs.remove(fullLocalPath);
                console.log(`Local file deleted: ${fullLocalPath}`);
                res.status(200).json({ message: `File deleted successfully: ${fileName}` });
            } else {
                console.warn(`Local file not found for deletion: ${fullLocalPath}`);
                res.status(404).json({ message: `File not found: ${fileName}` });
            }

        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ message: 'Server error while deleting file.', error: error.message });
        }
    },

    /**
     * @route GET /api/files/stream/:fileId/:fileType
     * @description Streams a file dynamically based on ID and type, searching for common extensions.
     * @access Public
     * @param {string} req.params.fileId - The base ID of the file (e.g., lecture ID, course ID).
     * @param {string} req.params.fileType - The general type of content (e.g., 'video', 'image', 'pdf', 'zip').
     */
    streamFile: async (req, res) => { // Renamed from streamVideo to streamFile for clarity
        const { fileId, fileType } = req.params;

        if (!fileId || !fileType) {
            return res.status(400).send('File ID and type are required.');
        }

        const possibleExtensions = FILE_TYPE_EXTENSIONS_MAP[fileType];

        if (!possibleExtensions) {
            return res.status(400).send(`Unsupported file type for streaming: ${fileType}.`);
        }

        let fullPath = null;
        let foundFileName = null;

        // Iterate through possible extensions to find the file
        for (const ext of possibleExtensions) {
            const potentialFileName = `${fileId}${ext}`; // Filename is always just the ID + extension
            const potentialPath = path.join(COURSES_UPLOAD_DIR, potentialFileName);
            if (await fs.pathExists(potentialPath)) {
                fullPath = potentialPath;
                foundFileName = potentialFileName;
                break; // Found the file, stop searching
            }
        }

        if (!fullPath) {
            // If file not found, check if it's an image request and serve a default thumbnail
            if (fileType === 'image' && await fs.pathExists(DEFAULT_THUMBNAIL_PATH)) {
                fullPath = DEFAULT_THUMBNAIL_PATH;
                foundFileName = path.basename(DEFAULT_THUMBNAIL_PATH); // Get just the filename (e.g., 'default-thumbnail.png')
                // Proceed to stream the default image with 200 OK
            } else {
                // If not an image, or default thumbnail doesn't exist, return 404
                return res.status(404).send(`File not found for ID: ${fileId} with type: ${fileType} (checked extensions: ${possibleExtensions.join(', ')}).`);
            }
        }

        try {
            const stat = await fs.stat(fullPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            const contentType = mimeTypes.lookup(foundFileName) || 'application/octet-stream';

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(fullPath, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                };

                res.writeHead(206, head); // 206 Partial Content
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                };
                res.writeHead(200, head); // 200 OK
                fs.createReadStream(fullPath).pipe(res);
            }
        } catch (error) {
            console.error(`Error streaming file from ${fullPath}:`, error);
            if (error.code === 'ENOENT') { // This specific error should ideally be caught by fs.pathExists
                return res.status(404).send('File not found.');
            }
            res.status(500).send('Internal Server Error');
        }
    },
    uploadEntityImage: (req, res) => {
    uploadEntityImageFile(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Error (Entity Image Upload):', err.message);
            return res.status(400).json({ message: `Image upload error: ${err.message}` });
        } else if (err) {
            console.error('General Upload Error (Entity Image Upload):', err.message);
            return res.status(500).json({ message: `Image upload failed: ${err.message}` });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided or image upload failed.' });
        }

        // Access id and entityType from req.params here as well
        const { id, entityType } = req.params; // <--- CHANGED: req.params instead of req.body
        const relativePath = path.relative(LOCAL_UPLOAD_BASE_DIR, req.file.path);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${relativePath.replace(/\\/g, '/')}`;

        res.status(200).json({
            message: `${entityType} image uploaded successfully`,
            filePath: fileUrl,
            fileName: req.file.originalname,
            fileId: id,
            entityType: entityType,
            fileSize: req.file.size,
            mimetype: req.file.mimetype
        });
    });
},

    streamEntityImage: async (req, res) => {
        const { id, entityType } = req.params;

        if (!id || !entityType) {
            return res.status(400).send('ID and entityType are required for entity image streaming.');
        }

        let targetDir;
        if (entityType === 'user') {
            targetDir = USERS_UPLOAD_DIR;
        } else if (entityType === 'lecturer') {
            targetDir = LECTURERS_UPLOAD_DIR;
        } else {
            return res.status(400).send('Invalid entityType for image streaming. Must be "user" or "lecturer".');
        }

        let fullPath = null;
        let foundFileName = null;
        const possibleImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']; // Common image formats

        // Search for the image file by ID across common extensions
        for (const ext of possibleImageExtensions) {
            const potentialFileName = `${id}${ext}`;
            const potentialPath = path.join(targetDir, potentialFileName);
            if (await fs.pathExists(potentialPath)) {
                fullPath = potentialPath;
                foundFileName = potentialFileName;
                break; // Found the file, stop searching
            }
        }

        if (!fullPath) {
            // If specific entity image not found, serve a default thumbnail
            if (await fs.pathExists(DEFAULT_USER_PATH)) {
                fullPath = DEFAULT_USER_PATH;
                foundFileName = path.basename(DEFAULT_USER_PATH);
            } else {
                return res.status(404).send(`${entityType} image not found for ID: ${id}.`);
            }
        }

        try {
            const stat = await fs.stat(fullPath);
            const fileSize = stat.size;
            const range = req.headers.range;

            const contentType = mimeTypes.lookup(foundFileName) || 'application/octet-stream';

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(fullPath, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                };

                res.writeHead(206, head); // 206 Partial Content
                file.pipe(res);
            } else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                };
                res.writeHead(200, head); // 200 OK
                fs.createReadStream(fullPath).pipe(res);
            }
        } catch (error) {
            console.error(`Error streaming ${entityType} image from ${fullPath}:`, error);
            if (error.code === 'ENOENT') {
                return res.status(404).send('Entity image file not found.');
            }
            res.status(500).send('Internal Server Error');
        }
    },
};
module.exports = fileController;