import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillsRequired: [String],
    projectIdea: String,
    resources: [{
        title: String,
        url: String,
        type: { type: String, default: 'link' }, // link, file
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    polls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Team', teamSchema);
