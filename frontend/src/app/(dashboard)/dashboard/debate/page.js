'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, Loader2, Send } from 'lucide-react';
import api from '@/lib/axios';

export default function DebatePage() {
    const [formData, setFormData] = useState({
        topic: '',
        role: 'for',
        argument: ''
    });
    const [debateHistory, setDebateHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Add user argument to history
        const userMessage = {
            type: 'user',
            content: formData.argument,
            role: formData.role,
            timestamp: new Date().toISOString()
        };

        try {
            const { data } = await api.post('/ai/debate', formData);

            if (data.success) {
                const aiMessage = {
                    type: 'ai',
                    content: data.data,
                    timestamp: new Date().toISOString()
                };
                setDebateHistory([...debateHistory, userMessage, aiMessage]);
                setFormData({ ...formData, argument: '' });
            } else {
                setError(data.error || 'Failed to get AI response');
            }
        } catch (err) {
            console.error("Debate error:", err);
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
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">AI Debate Coach</h1>
                        <p className="text-gray-400">Practice your argumentation skills with AI-powered debate</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Debate Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-fit z-10"
                    style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                    }}
                    whileHover={{
                        rotateY: 2,
                        scale: 1.01,
                        transition: { duration: 0.3 }
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Debate Topic
                            </label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="e.g., AI will replace human jobs"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Your Position
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'for' })}
                                    className={`py-2 px-4 rounded-lg font-medium transition-all ${formData.role === 'for'
                                        ? 'bg-green-500 text-white shadow-md shadow-green-500/50'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    For
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'against' })}
                                    className={`py-2 px-4 rounded-lg font-medium transition-all ${formData.role === 'against'
                                        ? 'bg-red-500 text-white shadow-md shadow-red-500/50'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    Against
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Your Argument
                            </label>
                            <textarea
                                value={formData.argument}
                                onChange={(e) => setFormData({ ...formData, argument: e.target.value })}
                                placeholder="Present your argument..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center justify-center space-x-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Debating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Submit Argument</span>
                                    </>
                                )}
                            </span>
                        </button>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* Debate History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Debate History</h2>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {debateHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                                <MessageCircle className="w-20 h-20 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-gray-300">No debate yet</p>
                                <p className="text-sm mt-2">Start by submitting your first argument</p>
                            </div>
                        ) : (
                            debateHistory.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${message.type === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-200'
                                        } rounded-2xl p-4 shadow-lg`}>
                                        {message.type === 'user' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${message.role === 'for' ? 'bg-green-400' : 'bg-red-400'
                                                    } text-white`}>
                                                    {message.role === 'for' ? 'FOR' : 'AGAINST'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                        {message.type === 'ai' && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-xs text-gray-400">AI Counter-Argument</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
