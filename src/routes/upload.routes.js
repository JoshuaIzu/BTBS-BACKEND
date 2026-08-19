const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('ONLY_IMAGES_ALLOWED'));
    }
  },
});

// POST /api/uploads - Upload single image
router.post(
  '/',
  protect,
  authorize('business'),
  upload.single('image'),
  uploadController.upload
);

module.exports = router;