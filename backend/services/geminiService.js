import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Validate API key on initialization
if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY is not set in environment variables');
    throw new Error('OPENROUTER_API_KEY is required for AI service');
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

// Using Meta's Llama 3.2 model through OpenRouter (free tier)
// This model is more reliably available than Gemini on OpenRouter
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

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
            const isRateLimitError = error.response?.status === 429 ||
                error.message?.includes('quota') ||
                error.message?.includes('rate limit');

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

/**
 * Call OpenRouter API
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - AI response text
 */
async function callOpenRouter(prompt, maxTokens = 2000) {
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: maxTokens
        },
        {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Edu-Ultra'
            }
        }
    );

    return response.data.choices[0].message.content;
}

/**
 * Call OpenRouter API with chat history
 * @param {Array} messages - Array of message objects
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - AI response text
 */
async function callOpenRouterWithHistory(messages, maxTokens = 1000) {
    const response = await axios.post(
        OPENROUTER_API_URL,
        {
            model: MODEL,
            messages: messages,
            max_tokens: maxTokens
        },
        {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Edu-Ultra'
            }
        }
    );

    return response.data.choices[0].message.content;
}

export const generateLearningPathArgs = async (topic, goals, level) => {
    const prompt = `Create a personalized learning path for the topic: ${topic}. 
  User goals: ${goals}. 
  Current level: ${level}.
  Provide the response in a structured JSON format with 'modules' array, where each module has 'title', 'description', and 'estimatedTime'.`;

    try {
        const text = await retryWithBackoff(async () => {
            return await callOpenRouter(prompt, 2000);
        });

        // Simple cleanup to ensure JSON is parseable if AI adds markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("OpenRouter AI Error in generateLearningPath:", error.response?.data || error.message);
        throw new Error(`Failed to generate learning path: ${error.response?.data?.error?.message || error.message}`);
    }
};

export const explainTopicArgs = async (topic, level) => {
    const prompt = `Explain the concept "${topic}" for a ${level} level student. 
    Provide a clear explanation, real-world examples, and key takeaways.`;

    try {
        return await retryWithBackoff(async () => {
            return await callOpenRouter(prompt, 2000);
        });
    } catch (error) {
        console.error("OpenRouter AI Error in explainTopic:", error.response?.data || error.message);
        throw new Error(`Failed to generate explanation: ${error.response?.data?.error?.message || error.message}`);
    }
};

export const generateQuizArgs = async (topic, difficulty, count = 5) => {
    const prompt = `Generate ${count} multiple-choice questions (MCQs) on "${topic}" at ${difficulty} difficulty.
    Return JSON format: { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "..." } ] }`;

    try {
        const text = await retryWithBackoff(async () => {
            return await callOpenRouter(prompt, 2000);
        });

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("OpenRouter AI Error in generateQuiz:", error.response?.data || error.message);
        throw new Error(`Failed to generate quiz: ${error.response?.data?.error?.message || error.message}`);
    }
};

export const chatWithAIArgs = async (message, history = []) => {
    try {
        return await retryWithBackoff(async () => {
            // Convert history to OpenRouter format
            const messages = [
                ...history.map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : msg.role,
                    content: msg.parts?.[0]?.text || msg.content || ''
                })),
                {
                    role: 'user',
                    content: message
                }
            ];

            return await callOpenRouterWithHistory(messages, 1000);
        });
    } catch (error) {
        console.error("OpenRouter AI Error in chatWithAI:", error.response?.data || error.message);
        throw new Error(`Failed to get chat response: ${error.response?.data?.error?.message || error.message}`);
    }
};

export const generateAssignmentArgs = async (topic, level) => {
    const prompt = `Suggest 3 widely different project or assignment ideas for "${topic}" suitable for a ${level} level student.
    Include a brief description, learning objectives, and estimated time for each.`;

    try {
        return await retryWithBackoff(async () => {
            return await callOpenRouter(prompt, 2000);
        });
    } catch (error) {
        console.error("OpenRouter AI Error in generateAssignment:", error.response?.data || error.message);
        throw new Error(`Failed to generate assignment ideas: ${error.response?.data?.error?.message || error.message}`);
    }
};
