import mongoose from 'mongoose';

const knowledgeCardSchema = new mongoose.Schema({
    concept: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ['common_idea', 'misunderstood_topic', 'high_value_insight', 'general'],
        default: 'general'
    },
    description: {
        type: String,
        required: true
    },
    frequency: {
        type: Number,
        default: 1
    },
    relatedVideos: [{
        videoAnalysisId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VideoAnalysis'
        },
        context: { type: String },
        timestamp: { type: String }
    }],
    importanceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    tags: [{
        type: String
    }],
    examples: [{
        type: String
    }],
    commonMisconceptions: [{
        type: String
    }],
    relatedConcepts: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


knowledgeCardSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});


knowledgeCardSchema.methods.calculateImportanceScore = function () {
    const baseScore = Math.min(this.frequency * 10, 70);
    const recencyBonus = this.relatedVideos.length > 0 ? 15 : 0;
    const categoryBonus = this.category === 'high_value_insight' ? 15 :
        this.category === 'misunderstood_topic' ? 10 : 0;

    this.importanceScore = Math.min(baseScore + recencyBonus + categoryBonus, 100);
    return this.importanceScore;
};


knowledgeCardSchema.index({ concept: 1 });
knowledgeCardSchema.index({ frequency: -1 });
knowledgeCardSchema.index({ importanceScore: -1 });
knowledgeCardSchema.index({ category: 1 });

const KnowledgeCard = mongoose.model('KnowledgeCard', knowledgeCardSchema);

export default KnowledgeCard;
