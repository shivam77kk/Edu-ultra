import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createServer } from 'http';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeSocket } from './config/socketHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { scheduleWeeklyReminders } from './services/cronJobs.js';

dotenv.config();

connectDB();

// Initialize cron jobs for scheduled tasks
scheduleWeeklyReminders();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true
}));
app.use(cookieParser());

// Session Middleware (Required for Passport)
app.use(session({
    secret: process.env.JWT_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assessment', assessmentRoutes); // Added as per instruction
app.use('/api/collaboration', collaborationRoutes); // Added as per instruction
app.use('/api/admin', adminRoutes); // Added as per instruction
app.use('/api/notes', noteRoutes); // Added as per instruction

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO initialized and ready for connections`);
});

