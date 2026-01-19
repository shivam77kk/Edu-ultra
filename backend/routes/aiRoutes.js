import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    generateLearningPath,
    explainTopic,
    generateQuiz,
    chatWithAI,
    generateAssignment,
    debateWithAI,
    generateStudyPlan
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// ENHANCED RATE LIMITING - MULTI-LAYER PROTECTION
// ============================================

// Layer 1: Aggressive IP-based rate limiting
// Prevents abuse from single IP addresses
const ipLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Reduced from 20 to 15 requests per IP
    message: {
        success: false,
        error: 'Too many AI requests from this IP. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests
});

// Layer 2: User-based rate limiting
// Prevents individual users from exhausting quota
const userLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 requests per user per hour
    keyGenerator: (req) => {
        // Use user ID if authenticated, fallback to IP
        return req.user?.id || req.ip;
    },
    message: {
        success: false,
        error: 'You have exceeded your hourly AI request limit. Please try again later.',
        retryAfter: '1 hour',
        limit: 30,
        window: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Layer 3: Daily quota per user
// Prevents users from exhausting daily quota
const dailyUserLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100, // 100 requests per user per day
    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    },
    message: {
        success: false,
        error: 'You have reached your daily AI request limit (100 requests). Please try again tomorrow.',
        retryAfter: '24 hours',
        limit: 100,
        window: '24 hours'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply protection and all rate limiting layers
router.use(protect); // Authentication required
router.use(ipLimiter); // IP-based limiting
router.use(userLimiter); // User hourly limiting
router.use(dailyUserLimiter); // User daily limiting

router.post('/learning-path', generateLearningPath);
router.post('/explain', explainTopic);
router.post('/quiz', generateQuiz);
router.post('/chat', chatWithAI);
router.post('/debate', debateWithAI);
router.post('/study-plan', generateStudyPlan);
router.post('/assignment', generateAssignment);

export default router;
