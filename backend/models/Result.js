import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: [{
        questionId: String,
        selectedOption: String,
        isCorrect: Boolean
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Result', resultSchema);
