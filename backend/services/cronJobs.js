import cron from 'node-cron';
import User from '../models/User.js';
import { sendWeeklyReminderEmail } from './emailService.js';

/**
 * Schedule weekly reminder emails
 * Runs every Monday at 9:00 AM
 */
export const scheduleWeeklyReminders = () => {
    // Schedule task to run every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
        console.log('Running weekly reminder email task...');

        try {
            // Get all active users
            const users = await User.find({ isActive: { $ne: false } }).select('name email');

            console.log(`Sending weekly reminders to ${users.length} users`);

            // Send emails to all users
            const emailPromises = users.map(user =>
                sendWeeklyReminderEmail(user.email, user.name)
                    .catch(err => {
                        console.error(`Failed to send weekly reminder to ${user.email}:`, err);
                        return { success: false, email: user.email, error: err.message };
                    })
            );

            const results = await Promise.all(emailPromises);

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            console.log(`Weekly reminders sent: ${successCount} successful, ${failCount} failed`);
        } catch (error) {
            console.error('Error in weekly reminder cron job:', error);
        }
    });

    console.log('✓ Weekly reminder email cron job scheduled (Every Monday at 9:00 AM)');
};

/**
 * Send test weekly reminder email (for testing purposes)
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
export const sendTestWeeklyReminder = async (email, name) => {
    try {
        const result = await sendWeeklyReminderEmail(email, name);
        console.log('Test weekly reminder sent:', result);
        return result;
    } catch (error) {
        console.error('Error sending test weekly reminder:', error);
        throw error;
    }
};
