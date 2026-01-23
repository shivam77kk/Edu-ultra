import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const getEducationNewsArgs = async (query = 'education technology') => {
    try {
        // Check for API Key
        if (!process.env.NEWS_API_KEY) {
            console.warn("NEWS_API_KEY missing. Returning mock data.");
            throw new Error("Missing API Key");
        }

        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: query,
                apiKey: process.env.NEWS_API_KEY,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 10
            }
        });

        if (response.data.status === 'ok') {
            return response.data.articles;
        } else {
            throw new Error('Failed to fetch news');
        }
    } catch (error) {
        console.error("News API Error (using fallback):", error.message);
        // Fallback Mock Data
        return [
            {
                title: "AI in Education: The Future is Here",
                description: "How artificial intelligence is transforming the way students learn and teachers teach.",
                url: "https://www.google.com/search?q=AI+in+Education",
                urlToImage: null,
                source: { name: "EduTech Daily" }
            },
            {
                title: "Top Study Techniques for 2024",
                description: "Experts share the most effective study methods including active recall and spaced repetition.",
                url: "https://www.google.com/search?q=Study+Techniques",
                urlToImage: null,
                source: { name: "Student Life" }
            }
        ];
    }
};
