import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String, // Markdown supported
        required: true
    },
    subject: {
        type: String
    },
    tags: [String],
    attachments: [{
        type: String // URLs from Cloudinary
    }],
    aiSummary: String,
    isShared: {
        type: Boolean,
        default: false
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

noteSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

export default mongoose.model('Note', noteSchema);
