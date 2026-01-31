import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not set in environment variables');
    throw new Error('GOOGLE_API_KEY is required for AI service');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


const FALLBACK_MODELS = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3-flash-preview"
];


let model = null;


async function getWorkingModel() {
    for (const modelName of FALLBACK_MODELS) {
        try {
            const testModel = genAI.getGenerativeModel({ model: modelName });
            
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


async function getModel() {
    if (!model) {
        model = await getWorkingModel();
    }
    return model;
}


async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            
            const isRateLimitError = error.message?.includes('quota') ||
                error.message?.includes('rate limit') ||
                error.message?.includes('429') ||
                error.status === 429;

            
            if (attempt === maxRetries || !isRateLimitError) {
                throw error;
            }

            
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);

            
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
    For each question:
    1. Provide the correct answer
    2. For EACH option (A, B, C, D), provide a brief explanation of why it is correct or incorrect
    
    Return JSON format: 
    { 
      "questions": [ 
        { 
          "question": "...", 
          "options": ["A", "B", "C", "D"], 
          "correctAnswer": "...", 
          "optionExplanations": {
            "A": "explanation for option A",
            "B": "explanation for option B", 
            "C": "explanation for option C",
            "D": "explanation for option D"
          }
        } 
      ] 
    }`;

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
                maxOutputTokens: 4096,
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


export const debateCoachArgs = async (topic, position, userArgument = '', mode = 'practice') => {
    let prompt = '';

    switch (mode) {
        case 'analyze':
            prompt = `Analyze the debate topic: "${topic}". 
            Provide:
            1. Key points for the "${position}" position
            2. Common arguments used
            3. Potential weaknesses to address
            4. Suggested research areas
            Return in JSON format: { "keyPoints": [], "commonArguments": [], "weaknesses": [], "researchAreas": [] }`;
            break;

        case 'counterargument':
            prompt = `For the debate topic "${topic}", the user is arguing "${position}" with this argument:
            "${userArgument}"
            
            Provide strong counterarguments that an opponent might use. Include:
            1. Main counterarguments (3-5)
            2. How to defend against each
            Return in JSON format: { "counterarguments": [{ "argument": "...", "defense": "..." }] }`;
            break;

        case 'feedback':
            prompt = `Evaluate this debate argument for the topic "${topic}" (position: ${position}):
            "${userArgument}"
            
            Provide constructive feedback on:
            1. Strength of argument (1-10)
            2. Logic and reasoning quality
            3. Evidence and support
            4. Areas for improvement
            5. Suggested improvements
            Return in JSON format: { "score": number, "strengths": [], "weaknesses": [], "improvements": [] }`;
            break;

        case 'practice':
        default:
            prompt = `Act as a debate coach for the topic: "${topic}". 
            The user is arguing for the "${position}" position.
            ${userArgument ? `User's current argument: "${userArgument}"` : ''}
            
            Provide:
            1. Opening statement suggestions
            2. Key arguments to develop
            3. Rebuttals to common opposing arguments
            4. Closing statement tips
            ${userArgument ? '5. Specific feedback on their argument' : ''}`;
            break;
    }

    try {
        const currentModel = await getModel();
        const result = await retryWithBackoff(async () => {
            return await currentModel.generateContent(prompt);
        });

        const response = result.response;
        const text = response.text();

        
        if (['analyze', 'counterargument', 'feedback'].includes(mode)) {
            try {
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            } catch (parseError) {
                
                console.warn('Failed to parse JSON response, returning text');
                return text;
            }
        }

        return text;
    } catch (error) {
        console.error("Gemini AI Error in debateCoach:", error.message);
        throw new Error(`Failed to generate debate coaching: ${error.message}`);
    }
};

