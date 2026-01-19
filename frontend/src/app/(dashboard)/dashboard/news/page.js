"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const { data } = await api.get("/news");
            setNews(data.data || []);
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setLoading(false);
        }
    };

    const summarizeArticle = async (url) => {
        try {
            const { data } = await api.post("/news/summarize", { url });
            alert(`Summary:\n\n${data.summary}`);
        } catch (error) {
            alert("Failed to generate summary");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Education News</h1>
                <p className="text-gray-400">Stay updated with the latest in education</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No news articles available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((article, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                        >
                            <h3 className="text-xl font-bold text-white mb-3">{article.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{article.description}</p>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Read More</span>
                                </a>
                                <button
                                    onClick={() => summarizeArticle(article.url)}
                                    className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 flex items-center space-x-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Summarize</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
