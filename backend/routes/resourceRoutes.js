import express from 'express';
import { uploadResource, getResources, deleteResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadResource);
router.get('/', getResources);
router.delete('/:id', deleteResource);

export default router;
