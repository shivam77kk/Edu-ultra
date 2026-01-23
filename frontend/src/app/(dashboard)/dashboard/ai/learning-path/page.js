"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Sparkles, Loader2, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LearningPathPage() {
    const router = useRouter();
    const [topic, setTopic] = useState("");
    const [goals, setGoals] = useState("");
    const [level, setLevel] = useState("Beginner");
    const [learningPath, setLearningPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const generatePath = async (e) => {
        e.preventDefault();
        if (!topic.trim() || !goals.trim()) return;

        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/ai/learning-path", { topic, goals, level });
            if (data.success && data.data) {
                setLearningPath(data.data);
            } else {
                setError("Failed to generate learning path. Please try again.");
            }
        } catch (error) {
            console.error("Learning path error:", error);
            setError(error.response?.data?.error || "Failed to generate learning path. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const createStudyPlan = () => {
        router.push(`/dashboard/ai/study-plan?topic=${encodeURIComponent(topic)}`);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">AI Learning Path Generator</h1>
                <p className="text-gray-400">Create a personalized learning roadmap for any topic</p>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <form onSubmit={generatePath} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Web Development, Data Science, Machine Learning..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Learning Goals</label>
                        <textarea
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            placeholder="What do you want to achieve? e.g., Build full-stack applications, Get a job as a data analyst..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Current Level</label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                        >
                            <option value="Beginner" className="text-gray-900 bg-white">Beginner</option>
                            <option value="Intermediate" className="text-gray-900 bg-white">Intermediate</option>
                            <option value="Advanced" className="text-gray-900 bg-white">Advanced</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Path...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Learning Path</span>
                            </>
                        )}
                    </button>
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

            {/* Learning Path Result */}
            <AnimatePresence>
                {learningPath && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Header with Action Button */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                        <Map className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Your Learning Path</h2>
                                        <p className="text-gray-400">{topic} - {level}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={createStudyPlan}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span>Create Study Plan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modules */}
                        {learningPath.modules && learningPath.modules.length > 0 ? (
                            <div className="space-y-4">
                                {learningPath.modules.map((module, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                                                <p className="text-gray-300 mb-3">{module.description}</p>
                                                {module.estimatedTime && (
                                                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm">
                                                        <span>⏱️ {module.estimatedTime}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {JSON.stringify(learningPath, null, 2)}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
