import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'image', 'note'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String
    },
    tags: [String],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    aiSummary: {
        type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Resource', resourceSchema);
