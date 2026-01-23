'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Loader2 } from 'lucide-react';

export default function StudyPlanPage() {
    const [formData, setFormData] = useState({
        subjects: '',
        examDate: '',
        availableHoursPerDay: 4
    });
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const subjectsArray = formData.subjects.split(',').map(s => s.trim());

            const response = await fetch('http://localhost:5000/api/ai/study-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subjects: subjectsArray,
                    examDate: formData.examDate,
                    availableHoursPerDay: formData.availableHoursPerDay
                })
            });

            const data = await response.json();

            if (data.success) {
                setStudyPlan(data.data);
            } else {
                setError(data.error || 'Failed to generate study plan');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Study Plan Generator</h1>
                        <p className="text-gray-400">Create a personalized study schedule for your exams</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Subjects
                            </label>
                            <input
                                type="text"
                                value={formData.subjects}
                                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                placeholder="Math, Physics, Chemistry (comma-separated)"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate subjects with commas</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Exam Date
                            </label>
                            <input
                                type="date"
                                value={formData.examDate}
                                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [color-scheme:dark]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Available Hours Per Day: {formData.availableHoursPerDay}h
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={formData.availableHoursPerDay}
                                onChange={(e) => setFormData({ ...formData, availableHoursPerDay: parseInt(e.target.value) })}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1h</span>
                                <span>12h</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center justify-center">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                        Generating...
                                    </>
                                ) : 'Generate Study Plan'}
                            </span>
                        </button>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </form>
                </motion.div>

                {/* Study Plan Display */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    {studyPlan ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/api/placeholder/80/80"
                                        alt="Study Plan"
                                        className="w-20 h-20 rounded-xl"
                                    />
                                    <h2 className="text-2xl font-bold text-white">Your Study Plan</h2>
                                </div>
                                {studyPlan.plan && studyPlan.plan.totalDays && (
                                    <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full font-semibold border border-blue-500/30">
                                        {studyPlan.plan.totalDays} Days
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {studyPlan.plan && studyPlan.plan.dailySchedule ? (
                                    studyPlan.plan.dailySchedule.map((day, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
                                                    {day.day}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        Day {day.day}
                                                    </h3>
                                                    {day.date && (
                                                        <p className="text-sm text-gray-400">{day.date}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {day.subjects && day.subjects.length > 0 && (
                                                <div className="space-y-2 mb-3">
                                                    {day.subjects.map((subject, idx) => (
                                                        <div key={idx} className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-white">{subject.subject}</span>
                                                                <span className="text-sm text-blue-400">{subject.duration}</span>
                                                            </div>
                                                            {subject.topic && (
                                                                <p className="text-sm text-gray-400 mt-1">{subject.topic}</p>
                                                            )}
                                                            {subject.timeSlot && (
                                                                <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                                                                    {subject.timeSlot}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {day.breaks && (
                                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-2 rounded">
                                                        <span className="font-medium text-yellow-400">Breaks: </span>
                                                        <span className="text-gray-300">{day.breaks}</span>
                                                    </div>
                                                )}
                                                {day.revision && (
                                                    <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded">
                                                        <span className="font-medium text-blue-400">Revision: </span>
                                                        <span className="text-gray-300">{day.revision}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 whitespace-pre-wrap">{JSON.stringify(studyPlan, null, 2)}</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Calendar className="w-24 h-24 mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-300">Your study plan will appear here</p>
                            <p className="text-sm mt-2">Fill out the form to generate your personalized schedule</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
