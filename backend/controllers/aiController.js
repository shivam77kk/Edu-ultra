import * as geminiService from '../services/geminiService.js';
import cache from '../services/cacheService.js';




export const generateLearningPath = async (req, res) => {
    const { topic, goals, level } = req.body;

    try {
        
        const cacheKey = { topic, goals, level };
        const cached = cache.get('learning-path', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        
        const path = await geminiService.generateLearningPathArgs(topic, goals, level);

        
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




export const explainTopic = async (req, res) => {
    const { topic, level = 'Medium' } = req.body;

    try {
        
        const cacheKey = { topic, level };
        const cached = cache.get('explain', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                explanation: cached,
                cached: true
            });
        }

        
        const explanation = await geminiService.explainTopicArgs(topic, level);

        
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




export const generateQuiz = async (req, res) => {
    const { topic, difficulty = 'Medium', numQuestions = 5 } = req.body;

    try {
        
        const cacheKey = { topic, difficulty, numQuestions };
        const cached = cache.get('quiz', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                quiz: cached,
                cached: true
            });
        }

        
        const quiz = await geminiService.generateQuizArgs(topic, difficulty, numQuestions);

        
        cache.set('quiz', cacheKey, quiz);

        res.status(200).json({
            success: true,
            quiz: quiz,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const chatWithAI = async (req, res) => {
    const { message, history = [] } = req.body;

    try {
        
        
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

        
        const reply = await geminiService.chatWithAIArgs(message, history);

        
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




export const debateWithAI = async (req, res) => {
    const { topic, role, argument } = req.body;

    const prompt = `We are debating "${topic}". I am arguing ${role}. You are the opponent. 
    Here is my argument: "${argument}". 
    Respond with a counter-argument, point out any logical fallacies, and score my argument strength (0-10).`;

    try {
        
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




export const generateStudyPlan = async (req, res) => {
    const { topic, duration } = req.body;

    try {
        
        const cacheKey = { topic, duration };
        const cached = cache.get('study-plan', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                plan: cached,
                cached: true
            });
        }

        const prompt = `Create a comprehensive and intensive study plan for "${topic}" over ${duration}. 

        The plan should be extremely detailed and include:
        
        ## Daily Breakdown
        - Specific topics to cover each day
        - Exact time allocation for each topic (in hours/minutes)
        - Learning objectives for each session
        - Recommended resources (books, videos, articles)
        
        ## Practice & Application
        - Hands-on exercises and projects for each day
        - Practice problems with difficulty levels
        - Real-world application examples
        
        ## Review & Reinforcement
        - Daily review sessions
        - Weekly comprehensive reviews
        - Self-assessment checkpoints
        
        ## Additional Elements
        - Break times and rest periods
        - Tips for effective learning
        - Common pitfalls to avoid
        - Milestone achievements
        
        Make this an intensive, actionable plan that covers the topic thoroughly. Format using markdown with clear headings, bullet points, and emphasis where appropriate.`;

        
        const plan = await geminiService.chatWithAIArgs(prompt);

        
        cache.set('study-plan', cacheKey, plan);

        res.status(200).json({
            success: true,
            plan: plan,
            cached: false
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const generateAssignment = async (req, res) => {
    const { topic, level = 'Medium' } = req.body;

    try {
        
        const cacheKey = { topic, level };
        const cached = cache.get('assignment', cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
                cached: true
            });
        }

        
        const ideas = await geminiService.generateAssignmentArgs(topic, level);

        
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
