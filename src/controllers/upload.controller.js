const uploadService = require('../services/upload.service');

class UploadController {
  upload = async (req, res) => {
    try {
      // Authentication check (handled by middleware)
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required.'
        });
      }

      // Role check - only business users can upload
      if (req.user.role !== 'business') {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Only business users can upload images.'
        });
      }

      // File validation
      if (!req.file) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Image File is required.'
        });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadService.uploadImage(req.file.buffer);

      return res.status(201).json({ imageUrl });

    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return res.status(500).json({
        error: 'SERVER_ERROR',
        message
      });
    }
  };
}

module.exports = new UploadController();