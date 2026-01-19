"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/axios";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIChatPage() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I am your AI study assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await api.post("/ai/chat", { message: input });
            // Assuming backend returns { success: true, data: "response text" } or similar
            // Adjust based on actual backend response structure. 
            // Based on aiController.js (standard), it likely returns data object.
            // Let's assume data.response or data.message
            const botMessage = { role: "assistant", content: data.response || data.message || "I understood that." };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat failed", error);
            const errorMessage = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center space-x-3">
                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
                    <p className="text-xs text-gray-500">Powered by Gemini</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex w-full",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        )}>
                            {msg.role === "assistant" && <Bot className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.role === "user" && <User className="w-4 h-4 ml-2 mt-0.5 flex-shrink-0" />}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-2">
                            <Bot className="w-4 h-4 text-gray-500" />
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" disabled={loading || !input.trim()} size="icon" className="w-11 h-11 shrink-0">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
