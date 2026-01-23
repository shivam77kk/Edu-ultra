import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import * as geminiService from '../services/geminiService.js';

// @desc    Get all assessments/quizzes
// @route   GET /api/assessments
// @access  Private
export const getAllAssessments = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .select('title topic difficulty questions createdAt')
            .sort({ createdAt: -1 });

        // Transform to include metadata
        const assessments = quizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title,
            description: `${quiz.difficulty} level quiz on ${quiz.topic}`,
            questions: quiz.questions,
            duration: quiz.questions.length * 2, // 2 minutes per question
            createdAt: quiz.createdAt
        }));

        res.status(200).json({ success: true, data: assessments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create a new AI Quiz and save to DB
// @route   POST /api/assessment/create
// @access  Private
export const createQuiz = async (req, res) => {
    const { topic, difficulty, count } = req.body;
    try {
        const quizData = await geminiService.generateQuizArgs(topic, difficulty, count || 5);

        const quiz = await Quiz.create({
            title: `${topic} ${difficulty} Quiz`,
            topic,
            difficulty,
            questions: quizData.questions,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Submit Quiz Answers
// @route   POST /api/assessment/submit
// @access  Private
export const submitQuiz = async (req, res) => {
    const { quizId, answers } = req.body; // answers: [{ questionId, selectedOption }]

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        let score = 0;
        const processedAnswers = [];

        // Simple evaluation logic
        // Assuming answers array matches structure or we map by question text/id
        // Since questionId might be index or _id, let's assume index for simplicity in this MVP 
        // or check if frontend sends index.

        // Robust way: Loop through quiz questions
        quiz.questions.forEach((q, index) => {
            // Find user answer for this question
            // Assuming 'answers' is an array of selected options in order OR objects
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;

            if (isCorrect) score++;

            processedAnswers.push({
                questionId: q._id, // if auto generated
                selectedOption: userAnswer,
                isCorrect
            });
        });

        const result = await Result.create({
            user: req.user.id,
            quiz: quizId,
            score,
            totalQuestions: quiz.questions.length,
            answers: processedAnswers
        });

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get user results
// @route   GET /api/assessment/results
// @access  Private
export const getResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id })
            .populate('quiz', 'title topic difficulty')
            .sort({ completedAt: -1 });

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
