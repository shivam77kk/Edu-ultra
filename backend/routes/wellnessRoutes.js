import express from 'express';
import { syncWellnessData, getWellnessData } from '../controllers/wellnessController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/sync', syncWellnessData);
router.get('/latest', getWellnessData);

export default router;
