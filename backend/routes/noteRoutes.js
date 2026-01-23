import express from 'express';
import { createNote, getNotes, summarizeNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createNote);
router.get('/', getNotes);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/summarize', summarizeNote);

export default router;
