import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'du7iys3nx';
const CLOUDINARY_UPLOAD_PRESET = 'MPL_UPLOAD'; // You'll need to create this in Cloudinary dashboard
const CLOUDINARY_API_KEY = '381119811935564';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Direct upload to Cloudinary from frontend
export const uploadToCloudinary = async (file, folder = 'mpl/gallery') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('api_key', CLOUDINARY_API_KEY);
    
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      }
    });
    
    return {
      success: true,
      url: response.data.secure_url,
      public_id: response.data.public_id,
      format: response.data.format,
      bytes: response.data.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      message: error.response?.data?.error?.message || 'Upload failed'
    };
  }
};

// Upload winner image
export const uploadWinnerImage = async (file, season) => {
  return uploadToCloudinary(file, `mpl/winners/season-${season}`);
};

// Upload gallery image
export const uploadGalleryImage = async (file, category) => {
  return uploadToCloudinary(file, `mpl/gallery/${category}`);
};