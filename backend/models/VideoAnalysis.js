import mongoose from 'mongoose';

const videoAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoMetadata: {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
        duration: { type: Number }, 
        uploadDate: { type: Date, default: Date.now }
    },
    transcript: {
        type: String,
        default: ''
    },
    summary: {
        full: { type: String, default: '' },
        tldr: { type: String, default: '' }
    },
    topic: {
        type: String,
        default: ''
    },
    learningObjective: {
        type: String,
        default: ''
    },
    keyPoints: [{
        point: { type: String, required: true },
        explanation: { type: String, required: true },
        timestamp: { type: String }, 
        importance: { type: Number, min: 1, max: 5, default: 3 }
    }],
    quiz: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }, 
        explanation: { type: String, required: true },
        timestamp: { type: String }
    }],
    flashCards: [{
        front: { type: String, required: true },
        back: { type: String, required: true },
        category: { type: String, default: 'general' }
    }],
    translations: [{
        language: { type: String, required: true },
        transcript: { type: String },
        summary: {
            full: { type: String },
            tldr: { type: String }
        },
        translatedAt: { type: Date, default: Date.now }
    }],
    importantMoments: [{
        timestamp: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, enum: ['visual', 'text', 'concept', 'other'], default: 'other' }
    }],
    concepts: [{
        name: { type: String, required: true },
        frequency: { type: Number, default: 1 },
        context: { type: String }
    }],
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    errorMessage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


videoAnalysisSchema.pre('save', function () {
    this.updatedAt = Date.now();
});


videoAnalysisSchema.index({ userId: 1, createdAt: -1 });
videoAnalysisSchema.index({ 'concepts.name': 1 });

const VideoAnalysis = mongoose.model('VideoAnalysis', videoAnalysisSchema);

export default VideoAnalysis;
