const cloudinary = require('../config/cloudinary');

class UploadService {
  uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'btbs/listings',
          resource_type: 'image'
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('UPLOAD_FAILED'));
            return;
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });
  };
}

module.exports = new UploadService();