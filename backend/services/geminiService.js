import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Validate API key on initialization
if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not set in environment variables');
    throw new Error('GOOGLE_API_KEY is required for AI service');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

/**
 * Retry helper function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if it's a quota/rate limit error
            const isRateLimitError = error.message?.includes('quota') ||
                error.message?.includes('rate limit') ||
                error.message?.includes('429') ||
                error.status === 429;

            // If it's the last attempt or not a rate limit error, throw
            if (attempt === maxRetries || !isRateLimitError) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

export const generateLearningPathArgs = async (topic, goals, level) => {
    const prompt = `Create a personalized learning path for the topic: ${topic}. 
  User goals: ${goals}. 
  Current level: ${level}.
  Provide the response in a structured JSON format with 'modules' array, where each module has 'title', 'description', and 'estimatedTime'.`;

    try {
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });

        const response = result.response;
        const text = response.text();

        // Simple cleanup to ensure JSON is parseable if AI adds markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini AI Error in generateLearningPath:", error.message);
        throw new Error(`Failed to generate learning path: ${error.message}`);
    }
};

export const explainTopicArgs = async (topic, level) => {
    const prompt = `Explain the concept "${topic}" for a ${level} level student. 
    Provide a clear explanation, real-world examples, and key takeaways.`;

    try {
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });

        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error in explainTopic:", error.message);
        throw new Error(`Failed to generate explanation: ${error.message}`);
    }
};

export const generateQuizArgs = async (topic, difficulty, count = 5) => {
    const prompt = `Generate ${count} multiple-choice questions (MCQs) on "${topic}" at ${difficulty} difficulty.
    Return JSON format: { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..." } ] }`;

    try {
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });

        const response = result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini AI Error in generateQuiz:", error.message);
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
};

export const chatWithAIArgs = async (message, history = []) => {
    try {
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await retryWithBackoff(async () => {
            return await chat.sendMessage(message);
        });

        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error in chatWithAI:", error.message);
        throw new Error(`Failed to get chat response: ${error.message}`);
    }
};

export const generateAssignmentArgs = async (topic, level) => {
    const prompt = `Suggest 3 widely different project or assignment ideas for "${topic}" suitable for a ${level} level student.
    Include a brief description, learning objectives, and estimated time for each.`;

    try {
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });

        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error in generateAssignment:", error.message);
        throw new Error(`Failed to generate assignment ideas: ${error.message}`);
    }
};
