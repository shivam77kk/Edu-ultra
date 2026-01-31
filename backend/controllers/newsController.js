import * as newsService from '../services/newsService.js';
import * as geminiService from '../services/geminiService.js'; 




export const getNews = async (req, res) => {
    const { query } = req.query;
    const searchQuery = query || 'education technology student learning';

    try {
        const articles = await newsService.getEducationNewsArgs(searchQuery);

        
        
        

        res.status(200).json({ success: true, count: articles.length, data: articles });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const summarizeNews = async (req, res) => {
    const { content } = req.body;
    try {
        
        
        

        
        
        
        

        const prompt = `Summarize this education news article in 3 bullet points: ${content.substring(0, 2000)}`; 
        const summary = await geminiService.chatWithAIArgs(prompt);

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
