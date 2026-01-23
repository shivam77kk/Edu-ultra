"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Play, Award, Loader2, Sparkles, BookOpen, Copy, Check } from "lucide-react";
import api from "@/lib/axios";

export default function AssessmentsPage() {
    const [activeTab, setActiveTab] = useState("assessments"); // "assessments" or "assignments"
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Assignment Generator State
    const [assignmentForm, setAssignmentForm] = useState({
        topic: '',
        level: 'Medium'
    });
    const [generatedAssignment, setGeneratedAssignment] = useState(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentError, setAssignmentError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (activeTab === "assessments") {
            fetchAssessments();
        }
    }, [activeTab]);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/assessments");
            setAssessments(data.data || []);
        } catch (error) {
            console.error("Failed to fetch assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentForm.topic.trim()) return;

        setAssignmentLoading(true);
        setAssignmentError('');
        setGeneratedAssignment(null);

        try {
            const { data } = await api.post("/ai/assignment", assignmentForm);
            if (data.success && data.data) {
                setGeneratedAssignment(data.data);
            } else {
                setAssignmentError("Failed to generate assignment. Please try again.");
            }
        } catch (error) {
            console.error("Assignment generation error:", error);
            setAssignmentError(error.response?.data?.error || "Failed to generate assignment. Please try again.");
        } finally {
            setAssignmentLoading(false);
        }
    };

    const copyAssignment = () => {
        navigator.clipboard.writeText(generatedAssignment);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">Assessments & Assignments</h1>
                <p className="text-gray-400">Test your knowledge and generate custom assignments</p>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex space-x-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2"
            >
                <button
                    onClick={() => setActiveTab("assessments")}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === "assessments"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <ClipboardCheck className="w-5 h-5" />
                        <span>Assessments</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("assignments")}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === "assignments"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>Assignment Generator</span>
                    </div>
                </button>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "assessments" ? (
                    <motion.div
                        key="assessments"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading ? (
                            <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                            </div>
                        ) : assessments.length === 0 ? (
                            <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <ClipboardCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No assessments available yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assessments.map((assessment, index) => (
                                    <motion.div
                                        key={assessment._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mb-4">
                                            <ClipboardCheck className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{assessment.title}</h3>
                                        <p className="text-gray-400 text-sm mb-4">{assessment.description}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <span>{assessment.questions?.length || 0} questions</span>
                                            <span>{assessment.duration || 30} min</span>
                                        </div>
                                        <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]">
                                            <Play className="w-4 h-4" />
                                            <span>Start Quiz</span>
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="assignments"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Assignment Form */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={assignmentLoading}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
                                >
                                    {assignmentLoading ? (
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
                                {assignmentError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl"
                                    >
                                        {assignmentError}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Assignment Result */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-h-[500px] overflow-y-auto">
                                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                {generatedAssignment}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                    <BookOpen className="w-24 h-24 mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-gray-300">Your assignment will appear here</p>
                                    <p className="text-sm mt-2">Fill out the form to generate ideas</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
