'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Sparkles, Loader2, Clock } from 'lucide-react';
import api from '@/lib/axios';

export default function LearningPathPage() {
    const [formData, setFormData] = useState({
        topic: '',
        goals: '',
        level: 'Beginner'
    });
    const [learningPath, setLearningPath] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/ai/learning-path', formData);

            if (data.success) {
                setLearningPath(data.data);
            } else {
                setError(data.error || 'Failed to generate learning path');
            }
        } catch (err) {
            console.error("Learning path error:", err);
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Map className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Learning Path Generator</h1>
                        <p className="text-gray-400">Create a personalized learning journey tailored to your goals</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Topic
                            </label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="e.g., Machine Learning, Web Development"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Learning Goals
                            </label>
                            <textarea
                                value={formData.goals}
                                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                placeholder="What do you want to achieve?"
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Current Level
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate Learning Path</span>
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* Results Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                    {learningPath ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Map className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Your Learning Path</h2>
                            </div>
                            {learningPath.modules && learningPath.modules.map((module, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-400 mb-3">{module.description}</p>
                                            <div className="flex items-center gap-2 text-sm text-blue-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{module.estimatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Map className="w-24 h-24 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-300">Your learning path will appear here</p>
                            <p className="text-sm mt-2">Fill out the form to get started</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
