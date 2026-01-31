import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'educator', 'admin'],
        default: 'student'
    },
    googleId: String,
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/shivamtonpe/image/upload/v1/default-avatar.png' 
    },
    educationLevel: String,
    learningGoals: [String],
    skillInterests: [String],
    dailyStudyTimePreference: Number, 
    createdAt: {
        type: Date,
        default: Date.now
    }
});



userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});


userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
