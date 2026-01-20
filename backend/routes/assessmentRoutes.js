import express from 'express';
import { createQuiz, submitQuiz, getResults } from '../controllers/assessmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/create', createQuiz);
router.post('/submit', submitQuiz);
router.get('/results', getResults);

export default router;
