"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Loader2, Copy, Check, Download } from "lucide-react";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StudyPlanPage() {
    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState("1 week");
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const generatePlan = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError("");
        try {
            const { data } = await api.post("/ai/study-plan", { topic, duration });
            if (data.success && data.plan) {
                setStudyPlan(data.plan);
            } else {
                setError("Failed to generate study plan. Please try again.");
            }
        } catch (error) {
            console.error("Study plan error:", error);
            setError(error.response?.data?.error || "Failed to generate study plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(studyPlan);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadPlan = () => {
        const element = document.createElement("a");
        const file = new Blob([studyPlan], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `study-plan-${topic.replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">AI Study Plan Generator</h1>
                <p className="text-gray-400">Create personalized study plans with AI</p>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <form onSubmit={generatePlan} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">What do you want to study?</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Machine Learning, React.js, Calculus..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Study Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                        >
                            <option value="1 week" className="text-gray-900 bg-white">1 Week</option>
                            <option value="2 weeks" className="text-gray-900 bg-white">2 Weeks</option>
                            <option value="1 month" className="text-gray-900 bg-white">1 Month</option>
                            <option value="3 months" className="text-gray-900 bg-white">3 Months</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Study Plan</span>
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

            {/* Study Plan Result */}
            <AnimatePresence>
                {studyPlan && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Your Study Plan</h2>
                                    <p className="text-gray-400">{topic} - {duration}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center space-x-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={downloadPlan}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {studyPlan}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
