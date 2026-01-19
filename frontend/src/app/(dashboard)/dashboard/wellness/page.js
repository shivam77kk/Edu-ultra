"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, TrendingUp, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function WellnessPage() {
    const [wellnessData, setWellnessData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWellnessData();
    }, []);

    const fetchWellnessData = async () => {
        try {
            const { data } = await api.get("/wellness");
            setWellnessData(data.data);
        } catch (error) {
            console.error("Failed to fetch wellness data:", error);
        } finally {
            setLoading(false);
        }
    };

    const syncData = async () => {
        try {
            await api.post("/wellness/sync", {
                steps: 8500,
                sleep: 7.5,
                mood: "good"
            });
            fetchWellnessData();
            alert("Wellness data synced!");
        } catch (error) {
            alert("Failed to sync data");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Wellness Center</h1>
                    <p className="text-gray-400">Track your mental and physical well-being</p>
                </div>
                <button
                    onClick={syncData}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700"
                >
                    Sync Data
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Mood</h3>
                        <p className="text-3xl font-bold text-white mb-2">{wellnessData?.mood || "Good"}</p>
                        <p className="text-gray-400 text-sm">How you're feeling today</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Steps</h3>
                        <p className="text-3xl font-bold text-white mb-2">{wellnessData?.steps || "8,500"}</p>
                        <p className="text-gray-400 text-sm">Daily activity goal</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Sleep</h3>
                        <p className="text-3xl font-bold text-white mb-2">{wellnessData?.sleep || "7.5"}h</p>
                        <p className="text-gray-400 text-sm">Last night's sleep</p>
                    </motion.div>
                </div>
            )}

            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-2">💚 Wellness Tips</h3>
                <ul className="text-gray-300 space-y-2">
                    <li>• Take regular breaks while studying (Pomodoro technique)</li>
                    <li>• Stay hydrated - aim for 8 glasses of water daily</li>
                    <li>• Get 7-9 hours of sleep for optimal learning</li>
                    <li>• Practice mindfulness or meditation for 10 minutes daily</li>
                </ul>
            </div>
        </div>
    );
}
