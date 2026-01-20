import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Could be null if system generated
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Quiz', quizSchema);
