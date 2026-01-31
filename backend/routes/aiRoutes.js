import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    generateLearningPath,
    explainTopic,
    generateQuiz,
    chatWithAI,
    generateAssignment,
    debateWithAI,
    generateStudyPlan
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.use(protect); 

router.post('/learning-path', generateLearningPath);
router.post('/explain', explainTopic);
router.post('/quiz', generateQuiz);
router.post('/chat', chatWithAI);
router.post('/debate', debateWithAI);
router.post('/study-plan', generateStudyPlan);
router.post('/assignment', generateAssignment);

export default router;
