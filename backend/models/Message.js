import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String
    },
    type: {
        type: String,
        enum: ['text', 'poll', 'file'],
        default: 'text'
    },
    poll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll'
    },
    fileUrl: String,
    fileName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', messageSchema);
