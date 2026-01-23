import mongoose from 'mongoose';
try {
    const Team = (await import('./models/Team.js')).default;
    console.log('Team loaded');
    const Poll = (await import('./models/Poll.js')).default;
    console.log('Poll loaded');
    const Message = (await import('./models/Message.js')).default;
    console.log('Message loaded');
} catch (e) {
    console.error(e);
}
