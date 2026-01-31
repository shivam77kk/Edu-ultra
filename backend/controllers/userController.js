import User from '../models/User.js';




export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.educationLevel = req.body.educationLevel || user.educationLevel;
            user.learningGoals = req.body.learningGoals || user.learningGoals;
            user.skillInterests = req.body.skillInterests || user.skillInterests;
            user.dailyStudyTimePreference = req.body.dailyStudyTimePreference || user.dailyStudyTimePreference;

            if (req.body.password) {
                user.password = req.body.password;
            }

            
            
            if (req.body.avatar) {
                user.avatar = req.body.avatar;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                success: true,
                data: updatedUser
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        
        user.avatar = req.file.path;
        user.avatarPublicId = req.file.filename;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                avatar: user.avatar
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};




export const removeProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        
        user.avatar = undefined;
        user.avatarPublicId = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile image removed'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

