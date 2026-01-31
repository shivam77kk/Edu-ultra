"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Lightbulb,
    FileQuestion,
    Calendar,
    Map,
    MessageCircle,
    FileText,
    Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AIToolsPage() {
    const aiTools = [
        {
            icon: MessageSquare,
            title: "AI Chat",
            description: "Have a conversation with our AI assistant for instant help",
            href: "/dashboard/ai/chat",
            gradient: "from-blue-600 to-cyan-600",
            endpoint: "/ai/chat"
        },
        {
            icon: Lightbulb,
            title: "Topic Explainer",
            description: "Get detailed explanations on any topic you're studying",
            href: "/dashboard/ai/explain",
            gradient: "from-purple-600 to-pink-600",
            endpoint: "/ai/explain"
        },
        {
            icon: FileQuestion,
            title: "Quiz Generator",
            description: "Generate custom quizzes to test your knowledge",
            href: "/dashboard/ai/quiz",
            gradient: "from-green-600 to-emerald-600",
            endpoint: "/ai/quiz"
        },
        {
            icon: Calendar,
            title: "Study Plan",
            description: "Create personalized study plans with AI assistance",
            href: "/dashboard/ai/study-plan",
            gradient: "from-amber-600 to-orange-600",
            endpoint: "/ai/study-plan"
        },
        {
            icon: Map,
            title: "Learning Path",
            description: "Get a customized learning roadmap for your goals",
            href: "/dashboard/ai/learning-path",
            gradient: "from-rose-600 to-red-600",
            endpoint: "/ai/learning-path"
        },
        {
            icon: MessageCircle,
            title: "Debate Coach",
            description: "Practice debates and improve your argumentation skills",
            href: "/dashboard/ai/debate",
            gradient: "from-indigo-600 to-blue-600",
            endpoint: "/ai/debate"
        },
        {
            icon: FileText,
            title: "Assignment Generator",
            description: "Generate practice assignments and exercises",
            href: "/dashboard/ai/assignment",
            gradient: "from-violet-600 to-purple-600",
            endpoint: "/ai/assignment"
        },
    ];

    return (
        <div className="space-y-8">
            {}
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">AI Tools</h1>
                        <p className="text-gray-400">Supercharge your learning with AI-powered tools</p>
                    </div>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <Link key={index} href={tool.href}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                                    <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                                        Try it now →
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-2">💡 Pro Tip</h3>
                <p className="text-gray-300">
                    All AI tools are powered by advanced language models. The more specific your questions or prompts,
                    the better the results you'll get. Try combining multiple tools for the best learning experience!
                </p>
            </div>
        </div>
    );
}
