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
    hackathonName: String, // Optional, if for a specific event
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Team', teamSchema);
