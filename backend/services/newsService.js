import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const getEducationNewsArgs = async (query = 'education technology') => {
    try {
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
        console.error("News API Error:", error.message);
        throw new Error('Failed to fetch news');
    }
};
