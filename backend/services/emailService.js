import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

/**
 * Send welcome email to new user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
export const sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Edu-Ultra <noreply@edu-ultra.com>',
        to: email,
        subject: 'Welcome to Edu-Ultra! 🎉',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .feature-list {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .feature-item:last-child {
            border-bottom: none;
        }
        .cta-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Edu-Ultra! 🎉</h1>
    </div>
    <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        
        <p>We're excited to have you on board!</p>
        
        <p>Edu-Ultra is built to help you <strong>learn smarter, grow faster, and stay ahead</strong> with high-quality content, structured learning paths, and consistent progress tracking.</p>
        
        <div class="feature-list">
            <h3>✨ What you can do now:</h3>
            <div class="feature-item">📚 Explore courses designed for real-world skills</div>
            <div class="feature-item">📊 Track your learning progress</div>
            <div class="feature-item">⏰ Get weekly reminders to stay consistent</div>
            <div class="feature-item">🎯 Learn at your own pace, anytime, anywhere</div>
        </div>
        
        <p><strong>🔐 Your Account Email:</strong> ${email}</p>
        
        <p>If you ever need help, feel free to reach out — we're here for you.</p>
        
        <p>Let's build your future, one lesson at a time. 💡</p>
        
        <p><strong>Happy Learning,</strong><br>
        Team Edu-Ultra</p>
        
        <div class="footer">
            <p>🌐 Edu-Ultra – Learn Beyond Limits</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `Hi ${name},

Welcome to Edu-Ultra! 🎉
We're excited to have you on board.

Edu-Ultra is built to help you learn smarter, grow faster, and stay ahead with high-quality content, structured learning paths, and consistent progress tracking.

✨ What you can do now:
* Explore courses designed for real-world skills
* Track your learning progress
* Get weekly reminders to stay consistent
* Learn at your own pace, anytime, anywhere

🔐 Your Account Email: ${email}

If you ever need help, feel free to reach out — we're here for you.

Let's build your future, one lesson at a time. 💡

Happy Learning,
Team Edu-Ultra
🌐 Edu-Ultra – Learn Beyond Limits`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send weekly reminder email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
export const sendWeeklyReminderEmail = async (email, name) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Edu-Ultra <noreply@edu-ultra.com>',
        to: email,
        subject: 'Your Weekly Learning Reminder from Edu-Ultra 👋',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .motivation-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .action-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .action-item:last-child {
            border-bottom: none;
        }
        .cta-button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Weekly Learning Reminder 📚</h1>
    </div>
    <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        
        <p>Just a friendly reminder from <strong>Edu-Ultra</strong> 👋</p>
        
        <p>Consistency is the key to mastery, and even <strong>30 minutes of learning today</strong> can make a big difference in your journey.</p>
        
        <div class="motivation-box">
            <h3>🚀 This week's motivation:</h3>
            <div class="action-item">✅ Pick up where you left off</div>
            <div class="action-item">📖 Revise previous lessons</div>
            <div class="action-item">🔍 Explore something new</div>
            <div class="action-item">🎯 Stay one step ahead of your goals</div>
        </div>
        
        <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <strong>Remember:</strong><br>
            <em>Small steps every week → Big success over time.</em>
        </p>
        
        <p>Log in and continue your learning journey today 💻✨</p>
        
        <p>You've got this! 💪</p>
        
        <p><strong>Team Edu-Ultra</strong></p>
        
        <div class="footer">
            <p>🌐 Edu-Ultra – Learn Beyond Limits</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `Hi ${name},

Just a friendly reminder from Edu-Ultra 👋

Consistency is the key to mastery, and even 30 minutes of learning today can make a big difference in your journey.

🚀 This week's motivation:
* Pick up where you left off
* Revise previous lessons
* Explore something new
* Stay one step ahead of your goals

Remember:
Small steps every week → Big success over time.

Log in and continue your learning journey today 💻✨

You've got this! 💪
Team Edu-Ultra
🌐 Edu-Ultra – Learn Beyond Limits`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Weekly reminder email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending weekly reminder email:', error);
        return { success: false, error: error.message };
    }
};

export default transporter;
