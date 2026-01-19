"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Play, Award, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function AssessmentsPage() {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const { data } = await api.get("/assessments");
            setAssessments(data.data || []);
        } catch (error) {
            console.error("Failed to fetch assessments:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Assessments & Quizzes</h1>
                <p className="text-gray-400">Test your knowledge and track your progress</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
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
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
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
                            <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2">
                                <Play className="w-4 h-4" />
                                <span>Start Quiz</span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
