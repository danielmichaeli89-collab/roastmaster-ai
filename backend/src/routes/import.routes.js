import express from 'express';
import multer from 'multer';
import { importRoestCSV } from '../controllers/import.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.post('/csv', authenticateToken, upload.single('file'), importRoestCSV);

export default router;
