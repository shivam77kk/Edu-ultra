"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileText, Loader2, Search, Eye, Edit, Trash2, X } from "lucide-react";
import api from "@/lib/axios";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewModal, setViewModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

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

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/resources/${editModal._id}`, {
                title: editModal.title,
                description: editModal.description
            });
            fetchResources();
            setEditModal(null);
        } catch (error) {
            console.error("Edit failed:", error);
            alert("Failed to update resource");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/resources/${deleteModal._id}`);
            fetchResources();
            setDeleteModal(null);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete resource");
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
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Resource Library</h1>
                    <p className="text-gray-400 text-sm md:text-base">Access and share educational materials</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search resources..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <label className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer flex items-center justify-center space-x-2 whitespace-nowrap">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredResources.map((resource, index) => (
                        <motion.div
                            key={resource._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2 truncate">{resource.title}</h3>
                            <p className="text-gray-400 text-xs md:text-sm mb-4 line-clamp-2">{resource.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span>{resource.type || "Document"}</span>
                                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setViewModal(resource)}
                                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-1 text-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View</span>
                                </button>
                                <a
                                    href={resource.url}
                                    download
                                    className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 flex items-center justify-center space-x-1 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setEditModal(resource)}
                                    className="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 flex items-center justify-center space-x-1 text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => setDeleteModal(resource)}
                                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 flex items-center justify-center space-x-1 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-white">View Resource</h2>
                            <button
                                onClick={() => setViewModal(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Title</p>
                                <p className="text-white font-medium">{viewModal.title}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Description</p>
                                <p className="text-white">{viewModal.description}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Type</p>
                                <p className="text-white">{viewModal.type || "Document"}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Uploaded</p>
                                <p className="text-white">{new Date(viewModal.createdAt).toLocaleString()}</p>
                            </div>
                            <a
                                href={viewModal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 text-center"
                            >
                                Open Resource
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-2xl"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Edit Resource</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="block text-white font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editModal.title}
                                    onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white font-medium mb-2">Description</label>
                                <textarea
                                    value={editModal.description}
                                    onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    required
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(null)}
                                    className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Delete Resource</h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
