import express from 'express';
import { createNote, getNotes, summarizeNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createNote);
router.get('/', getNotes);
router.post('/:id/summarize', summarizeNote);

export default router;
