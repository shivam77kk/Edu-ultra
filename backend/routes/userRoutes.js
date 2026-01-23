import express from 'express';
import { getUserProfile, updateUserProfile, getUsers, uploadProfileImage, removeProfileImage } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect); // Protect all routes below

router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

router.route('/profile/image')
    .post(upload.single('image'), uploadProfileImage)
    .delete(removeProfileImage);

router.route('/')
    .get(authorize('admin'), getUsers);

export default router;
