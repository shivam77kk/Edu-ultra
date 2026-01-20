import Note from '../models/Note.js';
import * as geminiService from '../services/geminiService.js';

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
    try {
        const { title, content, subject, tags } = req.body;
        const note = await Note.create({
            user: req.user.id,
            title,
            content,
            subject,
            tags
        });
        res.status(201).json({ success: true, data: note });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user notes
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Generate AI Summary for a note
// @route   POST /api/notes/:id/summarize
// @access  Private
// Uses Gemini to summarize the content
export const summarizeNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const prompt = `Summarize the following study notes efficiently: \n\n ${note.content}`;
        const summary = await geminiService.chatWithAIArgs(prompt);

        note.aiSummary = summary;
        await note.save();

        res.status(200).json({ success: true, data: note });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
