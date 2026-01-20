import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Validate API key on initialization
if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not set in environment variables');
    throw new Error('GOOGLE_API_KEY is required for AI service');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Fallback models to try in order
const FALLBACK_MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3-flash-preview"
];

// Cache the working model
let model = null;

/**
 * Test and get a working Gemini model from the fallback list
 * @returns {Promise<Object>} Working Gemini model instance
 */
async function getWorkingModel() {
    for (const modelName of FALLBACK_MODELS) {
        try {
            const testModel = genAI.getGenerativeModel({ model: modelName });
            // Test the model with a simple prompt
            await testModel.generateContent("test");
            console.log(`✅ Using model: ${modelName}`);
            return testModel;
        } catch (error) {
            console.log(`⚠️ Model ${modelName} failed, trying next fallback...`);
            continue;
        }
    }
    throw new Error('❌ All fallback models failed');
}

/**
 * Get or initialize the working model (with caching)
 * @returns {Promise<Object>} Working Gemini model instance
 */
async function getModel() {
    if (!model) {
        model = await getWorkingModel();
    }
    return model;
}

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
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
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
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
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
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
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
        const currentModel = await getModel();
        const chat = currentModel.startChat({
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
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
        });

        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error in generateAssignment:", error.message);
        throw new Error(`Failed to generate assignment ideas: ${error.message}`);
    }
};

export const generateStudyPlanArgs = async (subjects, examDate, availableHoursPerDay) => {
    const prompt = `Create a detailed daily study plan until ${examDate}. 
    Subjects: ${subjects.join(', ')}. 
    Available time: ${availableHoursPerDay} hours/day. 
    Include breaks and revision slots. 
    Return JSON format: { "plan": { "totalDays": number, "dailySchedule": [ { "day": number, "date": "YYYY-MM-DD", "subjects": [ { "subject": "...", "topic": "...", "duration": "X hours", "timeSlot": "morning/afternoon/evening" } ], "breaks": "...", "revision": "..." } ] } }`;

    try {
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
        });

        const response = result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini AI Error in generateStudyPlan:", error.message);
        throw new Error(`Failed to generate study plan: ${error.message}`);
    }
};
