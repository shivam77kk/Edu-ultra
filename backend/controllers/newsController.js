import * as newsService from '../services/newsService.js';
import * as geminiService from '../services/geminiService.js'; // Reusing Gemini for summarization if needed

// @desc    Get education news
// @route   GET /api/news
// @access  Private
export const getNews = async (req, res) => {
    const { query } = req.query;
    const searchQuery = query || 'education technology student learning';

    try {
        const articles = await newsService.getEducationNewsArgs(searchQuery);

        // Optional: Add AI summary to the top news item or all items
        // For performance, let's just return articles for now. 
        // In a real app, we might run them through Gemini to categorize "Fake News" or "Career Impact"

        res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Summarize a specific news article
// @route   POST /api/news/summarize
// @access  Private
export const summarizeNews = async (req, res) => {
    const { content } = req.body;
    try {
        // Reuse the explain or create a specific summarize function in geminiService
        // For now using explainTopicArgs with a specific prompt tweak on the client side conceptual equivalent
        // Or better, let's call Gemini directly here or add a helper

        // Let's assume we use the chat or a new method. 
        // I will add a simple summarize method to Gemini Service first if I was strict, 
        // but to save time, I'll use the existing chat or explain method logic.
        // Actually, let's just use the chat function for summarization.

        const prompt = `Summarize this education news article in 3 bullet points: ${content.substring(0, 2000)}`; // Limit char count
        const summary = await geminiService.chatWithAIArgs(prompt);

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
