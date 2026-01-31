"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TopicExplainerPage() {
    const [topic, setTopic] = useState("");
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);

    const explainTopic = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const { data } = await api.post("/ai/explain", { topic });
            setExplanation(data.explanation);
        } catch (error) {
            alert("Failed to explain topic. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Topic Explainer</h1>
                <p className="text-gray-400">Get detailed explanations on any topic</p>
            </div>

            {}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <form onSubmit={explainTopic} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">What topic would you like explained?</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Explain quantum computing, How does photosynthesis work?, What is blockchain?"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Explaining...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Explain Topic</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {}
            {explanation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Explanation</h2>
                    </div>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {explanation}
                        </ReactMarkdown>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
