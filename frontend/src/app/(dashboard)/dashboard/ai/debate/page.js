"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, Loader2, Trophy, Target } from "lucide-react";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DebateCoachPage() {
    const [topic, setTopic] = useState("");
    const [position, setPosition] = useState("for");
    const [userArgument, setUserArgument] = useState("");
    const [mode, setMode] = useState("practice");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [debateHistory, setDebateHistory] = useState([]);

    const startDebate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/ai/debate", { topic, role: position, argument: userArgument });
            if (data.success && data.data) {
                setResponse(data.data);
                if (userArgument.trim()) {
                    setDebateHistory([
                        ...debateHistory,
                        { role: "user", content: userArgument, position },
                        { role: "ai", content: typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2) }
                    ]);
                    setUserArgument("");
                }
            } else {
                setError("Failed to get debate response. Please try again.");
            }
        } catch (error) {
            console.error("Debate error:", error);
            setError(error.response?.data?.error || "Failed to get debate response. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetDebate = () => {
        setDebateHistory([]);
        setResponse(null);
        setUserArgument("");
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">AI Debate Coach</h1>
                <p className="text-gray-400">Practice debating and improve your argumentation skills</p>
            </motion.div>

            {/* Setup Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <form onSubmit={startDebate} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Debate Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Social media does more harm than good, AI will replace most jobs..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white font-medium mb-2">Your Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                                <option value="for" className="text-gray-900 bg-white">For (Supporting)</option>
                                <option value="against" className="text-gray-900 bg-white">Against (Opposing)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Mode</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                                <option value="practice" className="text-gray-900 bg-white">Practice Mode</option>
                                <option value="analyze" className="text-gray-900 bg-white">Analyze Topic</option>
                                <option value="counterargument" className="text-gray-900 bg-white">Get Counterarguments</option>
                                <option value="feedback" className="text-gray-900 bg-white">Get Feedback</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Your Argument (Optional for analysis)</label>
                        <textarea
                            value={userArgument}
                            onChange={(e) => setUserArgument(e.target.value)}
                            placeholder="Present your argument here..."
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>{debateHistory.length > 0 ? "Continue Debate" : "Start Debate"}</span>
                                </>
                            )}
                        </button>
                        {debateHistory.length > 0 && (
                            <button
                                type="button"
                                onClick={resetDebate}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Debate History */}
            <AnimatePresence>
                {debateHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                            <MessageSquare className="w-6 h-6" />
                            <span>Debate Exchange</span>
                        </h2>
                        {debateHistory.map((entry, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: entry.role === "user" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl ${entry.role === "user"
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                        : "bg-black/40 backdrop-blur-xl border border-white/10 text-gray-200"
                                    }`}>
                                    {entry.role === "user" ? (
                                        <>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Target className="w-4 h-4" />
                                                <span className="font-semibold text-sm">Your Argument ({entry.position})</span>
                                            </div>
                                            <p className="text-sm leading-relaxed">{entry.content}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Trophy className="w-4 h-4 text-yellow-400" />
                                                <span className="font-semibold text-sm text-yellow-400">AI Coach Response</span>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {entry.content}
                                                </ReactMarkdown>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Response */}
            <AnimatePresence>
                {response && debateHistory.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">AI Coach Analysis</h2>
                                <p className="text-gray-400">{topic}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
