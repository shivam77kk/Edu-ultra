import User from '../models/User.js';
import { sendWelcomeEmail } from '../services/emailService.js';


const sendTokenResponse = (user, statusCode, res) => {
    
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user
        });
};




export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        
        sendWelcomeEmail(email, name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};




export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};




export const logout = (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};



export const googleCallback = (req, res) => {
    
    const token = req.user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    
    res.cookie('token', token, options);

    
    if (req.user.isNew) {
        sendWelcomeEmail(req.user.email, req.user.name).catch(err => {
            console.error('Failed to send welcome email:', err);
        });
    }

    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?token=${token}`);
};
