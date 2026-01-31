"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2, Copy, Check } from "lucide-react";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AssignmentGeneratorPage() {
    const [assignmentForm, setAssignmentForm] = useState({
        topic: '',
        level: 'Medium'
    });
    const [generatedAssignment, setGeneratedAssignment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentForm.topic.trim()) return;

        setLoading(true);
        setError('');
        setGeneratedAssignment(null);

        try {
            const { data } = await api.post("/ai/assignment", assignmentForm);
            if (data.success && data.data) {
                setGeneratedAssignment(data.data);
            } else {
                setError("Failed to generate assignment. Please try again.");
            }
        } catch (error) {
            console.error("Assignment generation error:", error);
            setError(error.response?.data?.error || "Failed to generate assignment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyAssignment = () => {
        navigator.clipboard.writeText(generatedAssignment);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 pb-8">
            {}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">Assignment Generator</h1>
                <p className="text-gray-400">Generate custom project ideas and assignments with AI</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-fit"
                    style={{
                        transform: 'perspective(1000px) rotateY(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Generate Assignment</h2>
                            <p className="text-gray-400 text-sm">Create custom project ideas</p>
                        </div>
                    </div>

                    <form onSubmit={generateAssignment} className="space-y-4">
                        <div>
                            <label className="block text-white font-medium mb-2">Topic</label>
                            <input
                                type="text"
                                value={assignmentForm.topic}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, topic: e.target.value })}
                                placeholder="e.g., React Hooks, Data Structures, Machine Learning..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white font-medium mb-2">Difficulty Level</label>
                            <select
                                value={assignmentForm.level}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, level: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
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
                                    <span>Generate Assignment</span>
                                </>
                            )}
                        </button>
                    </form>

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

                {}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    style={{
                        transform: 'perspective(1000px) rotateY(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: '0 20px 60px rgba(168, 85, 247, 0.3)'
                    }}
                >
                    {generatedAssignment ? (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Generated Assignment</h3>
                                    <button
                                        onClick={copyAssignment}
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
                                </div>
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-h-[600px] overflow-y-auto">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {generatedAssignment}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-20">
                            <BookOpen className="w-24 h-24 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-300">Your assignment will appear here</p>
                            <p className="text-sm mt-2">Fill out the form to generate ideas</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
