"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            // Disconnect socket if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Initialize socket connection
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const newSocket = io(socketUrl, {
            auth: {
                userId: user.id
            },
            transports: ["websocket", "polling"]
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const joinRoom = (roomId) => {
        if (socket && connected) {
            socket.emit("join-room", roomId, user?.id);
        }
    };

    const leaveRoom = (roomId) => {
        if (socket && connected) {
            socket.emit("leave-room", roomId, user?.id);
        }
    };

    const sendMessage = (roomId, message) => {
        if (socket && connected) {
            socket.emit("send-message", roomId, message);
        }
    };

    const value = {
        socket,
        connected,
        joinRoom,
        leaveRoom,
        sendMessage
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
