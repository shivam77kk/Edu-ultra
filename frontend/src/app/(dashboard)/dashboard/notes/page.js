"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, FileText, Sparkles, Loader2, X } from "lucide-react";
import api from "@/lib/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: "", content: "" });
    const [summarizing, setSummarizing] = useState(null);
    const [noteSummaries, setNoteSummaries] = useState({});
    const [expandedSummaries, setExpandedSummaries] = useState({});

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get("/notes");
            setNotes(data.data || []);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveNote = async (e) => {
        e.preventDefault();
        try {
            if (currentNote._id) {
                await api.put(`/notes/${currentNote._id}`, currentNote);
            } else {
                await api.post("/notes", currentNote);
            }
            fetchNotes();
            setShowModal(false);
            setCurrentNote({ title: "", content: "" });
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    };

    const deleteNote = async (id) => {
        if (!confirm("Delete this note?")) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    const summarizeNote = async (id) => {
        setSummarizing(id);
        try {
            const { data } = await api.post(`/notes/${id}/summarize`);
            setNoteSummaries(prev => ({ ...prev, [id]: data.summary }));
            setExpandedSummaries(prev => ({ ...prev, [id]: true }));
        } catch (error) {
            console.error("Failed to summarize:", error);
            setNoteSummaries(prev => ({ ...prev, [id]: "Failed to generate summary. Please try again." }));
            setExpandedSummaries(prev => ({ ...prev, [id]: true }));
        } finally {
            setSummarizing(null);
        }
    };

    const toggleSummary = (id) => {
        setExpandedSummaries(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notes</h1>
                    <p className="text-gray-400">Organize your thoughts and study materials</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentNote({ title: "", content: "" });
                        setShowModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Note</span>
                </button>
            </div>

            {/* Notes Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No notes yet. Create your first note!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note, index) => (
                        <motion.div
                            key={note._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
                        >
                            <h3 className="text-xl font-bold text-white mb-3 truncate">{note.title}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{note.content}</p>

                            {/* AI Summary Section */}
                            <AnimatePresence>
                                {noteSummaries[note._id] && expandedSummaries[note._id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mb-4 overflow-hidden"
                                    >
                                        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                                    <span className="text-sm font-semibold text-purple-400">AI Summary</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newContent = note.content + "\n\n**Summary:**\n" + noteSummaries[note._id];
                                                        setCurrentNote({ ...note, content: newContent });
                                                        // trigger save immediately or via modal
                                                        // For now, let's open modal with updated content so user can review/save
                                                        setShowModal(true);
                                                    }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                                >
                                                    Add to Note
                                                </button>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {noteSummaries[note._id]}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        setCurrentNote(note);
                                        setShowModal(true);
                                    }}
                                    className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-1"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span className="text-sm">Edit</span>
                                </button>

                                {noteSummaries[note._id] ? (
                                    <button
                                        onClick={() => toggleSummary(note._id)}
                                        className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 flex items-center justify-center space-x-1"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-sm">{expandedSummaries[note._id] ? 'Hide' : 'Show'}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => summarizeNote(note._id)}
                                        disabled={summarizing === note._id}
                                        className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 flex items-center justify-center space-x-1 disabled:opacity-50"
                                    >
                                        {summarizing === note._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">AI</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteNote(note._id)}
                                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {currentNote._id ? "Edit Note" : "New Note"}
                        </h2>
                        <form onSubmit={saveNote} className="space-y-4">
                            <input
                                type="text"
                                value={currentNote.title}
                                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                placeholder="Note title..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <textarea
                                value={currentNote.content}
                                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                placeholder="Note content..."
                                rows={10}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                required
                            />
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
