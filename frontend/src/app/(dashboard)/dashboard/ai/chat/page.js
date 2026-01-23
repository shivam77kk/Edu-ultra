"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function AIChatPage() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I'm your AI learning assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const { data } = await api.post("/ai/chat", { message: userMessage });
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">AI Chat</h1>
                <p className="text-gray-400">Chat with our AI assistant for instant help</p>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                : "bg-gradient-to-r from-green-600 to-emerald-600"
                                }`}>
                                {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`flex-1 max-w-[85%] p-4 rounded-2xl break-words ${msg.role === "user"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "bg-white/5 text-gray-200"
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl">
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="border-t border-white/10 p-4">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
