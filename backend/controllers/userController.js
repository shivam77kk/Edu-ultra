import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
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

            // Cloudinary image upload will be handled separately/middleware, 
            // but if a URL is passed directly:
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

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
