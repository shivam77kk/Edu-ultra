"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Loader2, Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";

export default function StudyPlanPage() {
    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState("1 week");
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const generatePlan = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post("/ai/study-plan", { topic, duration });
            setStudyPlan(data.plan);
        } catch (error) {
            alert("Failed to generate study plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Study Plan Generator</h1>
                <p className="text-gray-400">Create personalized study plans with AI</p>
            </div>

            {/* Form */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <form onSubmit={generatePlan} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">What do you want to study?</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Machine Learning, React.js, Calculus..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white font-medium mb-2">Study Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1 week">1 Week</option>
                            <option value="2 weeks">2 Weeks</option>
                            <option value="1 month">1 Month</option>
                            <option value="3 months">3 Months</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
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
            </div>

            {/* Study Plan Result */}
            {studyPlan && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Your Study Plan</h2>
                            <p className="text-gray-400">{topic} - {duration}</p>
                        </div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {studyPlan}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
