import * as geminiService from '../services/geminiService.js';
import cache from '../services/cacheService.js';

// @desc    Generate a learning path
// @route   POST /api/ai/learning-path
// @access  Private
export const generateLearningPath = async (req, res) => {
    const { topic, goals, level } = req.body;

    try {
        // Check cache first
        const cacheKey = { topic, goals, level };
        const cached = cache.get('learning-path', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        // Generate new response
        const path = await geminiService.generateLearningPathArgs(topic, goals, level);

        // Cache the response
        cache.set('learning-path', cacheKey, path);

        res.status(200).json({
            success: true,
            data: path,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Explain a topic
// @route   POST /api/ai/explain
// @access  Private
export const explainTopic = async (req, res) => {
    const { topic, level = 'Medium' } = req.body;

    try {
        // Check cache first
        const cacheKey = { topic, level };
        const cached = cache.get('explain', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                explanation: cached,
                cached: true
            });
        }

        // Generate new explanation
        const explanation = await geminiService.explainTopicArgs(topic, level);

        // Cache the response
        cache.set('explain', cacheKey, explanation);

        res.status(200).json({
            success: true,
            explanation: explanation,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Generate a quiz
// @route   POST /api/ai/quiz
// @access  Private
export const generateQuiz = async (req, res) => {
    const { topic, difficulty = 'Medium' } = req.body;

    try {
        // Check cache first
        const cacheKey = { topic, difficulty };
        const cached = cache.get('quiz', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        // Generate new quiz
        const quiz = await geminiService.generateQuizArgs(topic, difficulty);

        // Cache the response
        cache.set('quiz', cacheKey, quiz);

        res.status(200).json({
            success: true,
            data: quiz,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Chat with AI Study Buddy
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = async (req, res) => {
    const { message, history = [] } = req.body;

    try {
        // Chat responses are typically unique, but we can cache simple queries
        // Only cache if no history (first message in conversation)
        let cached = null;
        if (history.length === 0) {
            const cacheKey = { message };
            cached = cache.get('chat', cacheKey);

            if (cached) {
                return res.status(200).json({
                    success: true,
                    response: cached,
                    cached: true
                });
            }
        }

        // Generate new response
        const reply = await geminiService.chatWithAIArgs(message, history);

        // Cache only if first message
        if (history.length === 0) {
            cache.set('chat', { message }, reply);
        }

        res.status(200).json({
            success: true,
            response: reply,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    AI Debate Mode
// @route   POST /api/ai/debate
// @access  Private
export const debateWithAI = async (req, res) => {
    const { topic, role, argument } = req.body;

    const prompt = `We are debating "${topic}". I am arguing ${role}. You are the opponent. 
    Here is my argument: "${argument}". 
    Respond with a counter-argument, point out any logical fallacies, and score my argument strength (0-10).`;

    try {
        // Debate responses are unique, don't cache
        const reply = await geminiService.chatWithAIArgs(prompt);
        res.status(200).json({
            success: true,
            data: reply,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Generate Study Plan
// @route   POST /api/ai/study-plan
// @access  Private
export const generateStudyPlan = async (req, res) => {
    const { subjects, examDate, availableHoursPerDay } = req.body;

    try {
        // Check cache first
        const cacheKey = { subjects, examDate, availableHoursPerDay };
        const cached = cache.get('study-plan', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        const prompt = `Create a detailed daily study plan until ${examDate}. 
        Subjects: ${subjects.join(', ')}. 
        Available time: ${availableHoursPerDay} hours/day. 
        Include breaks and revision slots. Output as JSON with 'days' array.`;

        // Generate new plan
        const plan = await geminiService.chatWithAIArgs(prompt);

        // Cache the response
        cache.set('study-plan', cacheKey, plan);

        res.status(200).json({
            success: true,
            data: plan,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Generate assignment ideas
// @route   POST /api/ai/assignment
// @access  Private
export const generateAssignment = async (req, res) => {
    const { topic, level = 'Medium' } = req.body;

    try {
        // Check cache first
        const cacheKey = { topic, level };
        const cached = cache.get('assignment', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        // Generate new ideas
        const ideas = await geminiService.generateAssignmentArgs(topic, level);

        // Cache the response
        cache.set('assignment', cacheKey, ideas);

        res.status(200).json({
            success: true,
            data: ideas,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
