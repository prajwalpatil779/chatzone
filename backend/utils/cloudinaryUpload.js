/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary
 */

const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'chatzone') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `chatzone-pro/${folder}`,
      resource_type: 'auto',
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
    };
  } catch (error) {
    // Keep local file so the API can fallback to /uploads URL.
    return {
      success: false,
      error: error.message,
      localFilePath: filePath,
    };
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
