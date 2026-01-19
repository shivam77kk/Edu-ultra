"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileText, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data } = await api.get("/resources");
            setResources(data.data || []);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        formData.append("description", "Uploaded resource");

        setUploading(true);
        try {
            await api.post("/resources/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchResources();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const filteredResources = resources.filter(r =>
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Resource Library</h1>
                    <p className="text-gray-400">Access and share educational materials</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search resources..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <label className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer flex items-center space-x-2 whitespace-nowrap">
                        <Upload className="w-5 h-5" />
                        <span>Upload</span>
                        <input
                            type="file"
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Resources Grid */}
            {loading || uploading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-gray-400 mt-4">{uploading ? "Uploading..." : "Loading..."}</p>
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                        {searchTerm ? "No resources found" : "No resources yet. Upload your first resource!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource, index) => (
                        <motion.div
                            key={resource._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 truncate">{resource.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span>{resource.type || "Document"}</span>
                                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                            </div>
                            <a
                                href={resource.fileUrl}
                                download
                                className="w-full px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-2 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </a>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
