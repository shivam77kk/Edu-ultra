import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a collaboration room
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
            console.log(`User ${userId} joined room ${roomId}`);
        });

        // Leave a collaboration room
        socket.on('leave-room', (roomId, userId) => {
            socket.leave(roomId);
            socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
            console.log(`User ${userId} left room ${roomId}`);
        });

        // Send message in room
        socket.on('send-message', (roomId, message) => {
            io.to(roomId).emit('receive-message', message);
        });

        // Typing indicator
        socket.on('typing', (roomId, userId) => {
            socket.to(roomId).emit('user-typing', userId);
        });

        socket.on('stop-typing', (roomId, userId) => {
            socket.to(roomId).emit('user-stop-typing', userId);
        });

        // Document collaboration
        socket.on('document-update', (roomId, update) => {
            socket.to(roomId).emit('document-changed', update);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
