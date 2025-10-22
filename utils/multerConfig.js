import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Uploads directory path
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Initialize multer with storage and file size limit (5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Middleware for single file upload
export const singleFileUpload = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          message: 'Unexpected file provided',
          success: false,
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size exceeds the maximum limit of 5MB',
          success: false,
        });
      }
    } else if (err) {
      return res.status(500).json({
        message: 'An unknown error occurred during file upload',
        success: false,
      });
    }
    next();
  });
};

// Middleware for multiple files upload
export const multipleFilesUpload = (fieldName, maxCount = 10) => (req, res, next) => {
  const uploader = upload.array(fieldName, maxCount);
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          message: `Unexpected files provided. Max allowed: ${maxCount}`,
          success: false,
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size exceeds the maximum limit of 5MB',
          success: false,
        });
      }
    } else if (err) {
      return res.status(500).json({
        message: 'An unknown error occurred during files upload',
        success: false,
      });
    }
    next();
  });
};
