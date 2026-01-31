"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Video,
    Upload,
    Loader2,
    FileVideo,
    CheckCircle2,
    XCircle,
    BookOpen,
    Brain,
    MessageSquare,
    Languages,
    TrendingUp,
    Download,
    Sparkles
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function VideoSummarizerPage() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [inputMode, setInputMode] = useState("file"); 
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const [translating, setTranslating] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState("Spanish");
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            
            const validTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"];
            if (!validTypes.includes(selectedFile.type)) {
                setError("Invalid file type. Please upload a video file (MP4, MPEG, MOV, AVI, WebM)");
                return;
            }
            
            if (selectedFile.size > 100 * 1024 * 1024) {
                setError("File size exceeds 100MB limit");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setAnalysis(null);
        }
    };

    const handleUploadAndAnalyze = async () => {
        if ((!file && inputMode === "file") || (!videoUrl && inputMode === "url") || !user) return;

        setUploading(true);
        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        if (inputMode === "file" && file) {
            formData.append("video", file);
        } else if (inputMode === "url" && videoUrl) {
            formData.append("videoUrl", videoUrl);
        }
        formData.append("userId", user._id);

        try {
            const { data } = await api.post("/video-analysis/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                setAnalysis(data.data);
                setActiveTab("summary");
            } else {
                setError(data.message || "Analysis failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze video. Please try again.");
        } finally {
            setUploading(false);
            setAnalyzing(false);
        }
    };

    const handleTranslate = async () => {
        if (!analysis || !targetLanguage) return;

        setTranslating(true);
        try {
            const { data } = await api.post(`/video-analysis/translate/${analysis.analysisId}`, {
                targetLanguage: targetLanguage,
            });

            if (data.success) {
                
                setAnalysis(prev => ({
                    ...prev,
                    translation: data.data["🌍 Translation"]
                }));
                setActiveTab("translation");
            }
        } catch (err) {
            setError("Translation failed. Please try again.");
        } finally {
            setTranslating(false);
        }
    };

    const tabs = [
        { id: "summary", label: "Summary", icon: BookOpen },
        { id: "keypoints", label: "Key Points", icon: Brain },
        { id: "quiz", label: "Quiz", icon: MessageSquare },
        { id: "flashcards", label: "Flash Cards", icon: Sparkles },
        { id: "knowledge", label: "Popular Topics", icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen">
            {}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <Video className="w-8 h-8 text-white" />
                    </div>
                    Video Summarizer
                </h1>
                <p className="text-gray-400 text-lg">
                    Upload educational videos and get AI-powered summaries, quizzes, and flash cards
                </p>
            </div>

            {}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6"
            >
                {}
                <div className="flex gap-2 mb-6 justify-center">
                    <button
                        onClick={() => { setInputMode("file"); setError(null); }}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${inputMode === "file"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                    >
                        Upload File
                    </button>
                    <button
                        onClick={() => { setInputMode("url"); setError(null); setFile(null); }}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${inputMode === "url"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                    >
                        Enter URL
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {inputMode === "file" ? (
                        !file ? (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative w-full max-w-2xl"
                            >
                                <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 hover:border-purple-500/50 transition-all group-hover:bg-white/5">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-semibold text-white mb-2">
                                                Click to upload video
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                Supports MP4, MPEG, MOV, AVI, WebM (Max 100MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="w-full max-w-2xl">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-600/20 rounded-lg">
                                            <FileVideo className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{file.name}</p>
                                            <p className="text-gray-400 text-sm">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUploadAndAnalyze}
                                    disabled={uploading}
                                    className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Analyzing Video...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Analyze Video
                                        </>
                                    )}
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="w-full max-w-2xl">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <label className="block text-white font-medium mb-3">
                                    Video URL (YouTube or Direct Link)
                                </label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <button
                                onClick={handleUploadAndAnalyze}
                                disabled={uploading || !videoUrl}
                                className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing Video...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Analyze Video
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                    >
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}
            </motion.div>

            {}
            <AnimatePresence>
                {analyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                            <div className="text-center">
                                <p className="text-xl font-semibold text-white mb-2">
                                    Analyzing your video...
                                </p>
                                <p className="text-gray-400">
                                    This may take a few minutes. We're extracting insights, generating quizzes, and creating flash cards.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {analysis && !analyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                    >
                        {}
                        <div className="border-b border-white/10 px-6 pt-6">
                            <div className="flex gap-2 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {}
                        <div className="p-6">
                            {}
                            {activeTab === "summary" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white/5 rounded-xl p-6">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {analysis["📌 Video Summary"]?.topic || "Video Topic"}
                                        </h3>
                                        <p className="text-purple-400 text-sm mb-4">
                                            {analysis["📌 Video Summary"]?.learningObjective || ""}
                                        </p>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-gray-300 leading-relaxed">
                                                {analysis["📌 Video Summary"]?.summary}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
                                        <p className="text-sm font-medium text-purple-300 mb-1">TL;DR</p>
                                        <p className="text-white">{analysis["📌 Video Summary"]?.tldr}</p>
                                    </div>

                                    {}
                                    <div className="bg-white/5 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Languages className="w-5 h-5 text-purple-400" />
                                            Translate Content
                                        </h3>
                                        <div className="flex gap-3">
                                            <select
                                                value={targetLanguage}
                                                onChange={(e) => setTargetLanguage(e.target.value)}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="Spanish">Spanish</option>
                                                <option value="French">French</option>
                                                <option value="German">German</option>
                                                <option value="Hindi">Hindi</option>
                                                <option value="Chinese">Chinese</option>
                                                <option value="Japanese">Japanese</option>
                                            </select>
                                            <button
                                                onClick={handleTranslate}
                                                disabled={translating}
                                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
                                            >
                                                {translating ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    "Translate"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {}
                            {activeTab === "keypoints" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    {analysis["🧠 Key Points"]?.map((point, index) => (
                                        <div key={index} className="bg-white/5 rounded-xl p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold mb-2">{point.point}</h4>
                                                    <p className="text-gray-400 text-sm mb-2">{point.explanation}</p>
                                                    {point.timestamp && (
                                                        <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                                                            {point.timestamp}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    {[...Array(point.importance || 3)].map((_, i) => (
                                                        <div key={i} className="w-2 h-2 bg-purple-400 rounded-full" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {}
                            {activeTab === "quiz" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    {analysis["❓ Quiz"]?.map((q, index) => (
                                        <div key={index} className="bg-white/5 rounded-xl p-6">
                                            <h4 className="text-white font-semibold mb-4">
                                                {index + 1}. {q.question}
                                            </h4>
                                            <div className="space-y-2 mb-4">
                                                {q.options?.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg border ${optIndex === q.correctAnswer
                                                            ? "bg-green-500/10 border-green-500/30 text-green-300"
                                                            : "bg-white/5 border-white/10 text-gray-300"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold">
                                                                {String.fromCharCode(65 + optIndex)}.
                                                            </span>
                                                            <span>{option}</span>
                                                            {optIndex === q.correctAnswer && (
                                                                <CheckCircle2 className="w-4 h-4 ml-auto" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                                                <p className="text-sm text-purple-300 font-medium mb-1">Explanation:</p>
                                                <p className="text-gray-300 text-sm">{q.explanation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {}
                            {activeTab === "flashcards" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {analysis["🗂 Flash Cards"]?.map((card, index) => (
                                        <div key={index} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all">
                                            <div className="mb-4">
                                                <span className="text-xs text-purple-400 font-medium uppercase">
                                                    {card.category}
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Front:</p>
                                                    <p className="text-white font-medium">{card.front}</p>
                                                </div>
                                                <div className="border-t border-white/10 pt-4">
                                                    <p className="text-sm text-gray-400 mb-1">Back:</p>
                                                    <p className="text-gray-300">{card.back}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {}
                            {activeTab === "knowledge" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    {analysis["🔥 Popular Knowledge Cards"]?.length > 0 ? (
                                        analysis["🔥 Popular Knowledge Cards"].map((card, index) => (
                                            <div key={index} className="bg-white/5 rounded-xl p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-white font-semibold text-lg">{card.concept}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                                                            {card.frequency}x mentioned
                                                        </span>
                                                        <span className="px-3 py-1 bg-pink-600/20 text-pink-300 text-xs rounded-full">
                                                            Score: {card.importanceScore}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400">{card.description}</p>
                                                <div className="mt-3">
                                                    <span className="inline-block px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-full">
                                                        {card.category}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-400">
                                                No popular topics yet. Analyze more videos to see trending concepts!
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
