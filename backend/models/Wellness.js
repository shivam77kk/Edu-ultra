import mongoose from 'mongoose';

const wellnessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    sleepHours: {
        type: Number,
        required: true
    },
    steps: {
        type: Number,
        required: true
    },
    activityType: {
        type: String, // e.g., 'walking', 'running', 'stationary'
        default: 'unknown'
    },
    focusScore: {
        type: Number, // Calculated metric 0-100
        default: 0
    },
    mood: {
        type: String,
        enum: ['happy', 'stressed', 'tired', 'neutral', 'energetic'],
        default: 'neutral'
    },
    alertGenerated: {
        type: String, // e.g., "Low sleep detected"
        default: null
    }
});

export default mongoose.model('Wellness', wellnessSchema);
