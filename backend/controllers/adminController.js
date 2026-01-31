import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';




export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalResources = await Resource.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();

        
        
        const results = await Result.find();
        let totalScoreAvg = 0;
        if (results.length > 0) {
            const sum = results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
            totalScoreAvg = (sum / results.length).toFixed(2);
        }

        const stats = {
            users: {
                total: totalUsers,
                educators: await User.countDocuments({ role: 'educator' }),
                students: await User.countDocuments({ role: 'student' })
            },
            content: {
                resources: totalResources,
                quizzes: totalQuizzes
            },
            learning: {
                averageScore: totalScoreAvg,
                totalTestsTaken: results.length
            }
        };

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
