import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudnairy.js'; 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fields', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export const uploadSingleFileCloud = (fieldName) =>
  multer({ storage }).single(fieldName);

export const uploadMultipleFilesCloud = (arrayOfFields) =>
  multer({ storage }).fields(arrayOfFields);
