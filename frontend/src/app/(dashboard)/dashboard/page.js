"use client";

import { motion } from "framer-motion";
import {
    Brain,
    BookOpen,
    Users,
    Award,
    Zap,
    Target,
    TrendingUp,
    Clock,
    StickyNote,
    ClipboardCheck
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const stats = [
        { icon: Brain, label: "AI Sessions", value: "24", change: "+12%", color: "from-blue-500 to-cyan-500" },
        { icon: BookOpen, label: "Resources", value: "156", change: "+8%", color: "from-purple-500 to-pink-500" },
        { icon: Users, label: "Team Members", value: "8", change: "+2", color: "from-green-500 to-emerald-500" },
        { icon: Award, label: "Completed", value: "12", change: "+4", color: "from-amber-500 to-orange-500" },
    ];

    const quickActions = [
        { icon: Brain, label: "AI Chat", desc: "Chat with AI assistant", href: "/dashboard/ai", gradient: "from-blue-600 to-cyan-600" },
        { icon: Zap, label: "Generate Quiz", desc: "Create custom quizzes", href: "/dashboard/ai", gradient: "from-purple-600 to-pink-600" },
        { icon: Target, label: "Study Plan", desc: "AI study planning", href: "/dashboard/ai", gradient: "from-green-600 to-emerald-600" },
        { icon: BookOpen, label: "Resources", desc: "Browse library", href: "/dashboard/resources", gradient: "from-amber-600 to-orange-600" },
        { icon: StickyNote, label: "Notes", desc: "Take smart notes", href: "/dashboard/notes", gradient: "from-rose-600 to-red-600" },
        { icon: ClipboardCheck, label: "Assessments", desc: "Take quizzes", href: "/dashboard/assessments", gradient: "from-indigo-600 to-blue-600" },
    ];

    const recentActivity = [
        { title: "Completed Python Quiz", time: "2 hours ago", type: "assessment", color: "bg-green-500" },
        { title: "AI Chat Session", time: "5 hours ago", type: "ai", color: "bg-blue-500" },
        { title: "Uploaded Study Notes", time: "1 day ago", type: "resource", color: "bg-purple-500" },
        { title: "Joined Team Alpha", time: "2 days ago", type: "team", color: "bg-amber-500" },
    ];

    return (
        <div className="space-y-8">
            {}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Welcome back! 👋</h1>
                    <p className="text-blue-100 text-lg">Ready to continue your learning journey?</p>
                </div>
            </motion.div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-white text-3xl font-bold">{stat.value}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link key={index} href={action.href}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`bg-gradient-to-r ${action.gradient} rounded-xl p-6 text-white cursor-pointer shadow-lg hover:shadow-2xl transition-all`}
                                >
                                    <Icon className="w-8 h-8 mb-3" />
                                    <p className="font-bold text-lg mb-1">{action.label}</p>
                                    <p className="text-white/80 text-sm">{action.desc}</p>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                        <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{activity.title}</p>
                                    <p className="text-gray-400 text-sm">{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Learning Progress</h3>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Weekly Goal</span>
                                <span className="text-white font-medium">75%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "75%" }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Study Streak</span>
                                <span className="text-white font-medium">12 days 🔥</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "60%" }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Assessments</span>
                                <span className="text-white font-medium">8/10</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "80%" }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
