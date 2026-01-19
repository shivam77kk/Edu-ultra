import express from 'express';
import { getNews, summarizeNews } from '../controllers/newsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNews);
router.post('/summarize', summarizeNews);

export default router;
