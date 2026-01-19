"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Camera, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function ProfilePage() {
    const { user, checkAuth } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                bio: user.bio || ""
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/users/profile", formData);
            await checkAuth();
            setEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                <p className="text-gray-400">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <Camera className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        {editing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Name"
                                    required
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Email"
                                    required
                                />
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Bio"
                                    rows={3}
                                />
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="flex-1 px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
                                <p className="text-gray-400 mb-4">{user?.bio || "No bio yet"}</p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-sm capitalize">{user?.role || "student"}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700"
                                >
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-gray-400 text-sm mb-2">Total Notes</h3>
                    <p className="text-3xl font-bold text-white">24</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-gray-400 text-sm mb-2">Quizzes Taken</h3>
                    <p className="text-3xl font-bold text-white">12</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-gray-400 text-sm mb-2">Study Streak</h3>
                    <p className="text-3xl font-bold text-white">12 days</p>
                </motion.div>
            </div>
        </div>
    );
}
