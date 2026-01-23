"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, Globe, Lock, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTeamPage() {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [newTeam, setNewTeam] = useState({
        name: '',
        description: '',
        isPrivate: false
    });

    const createTeam = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/collaboration/teams", newTeam);
            router.push("/dashboard/teams");
        } catch (error) {
            console.error("Failed to create team:", error);
            alert("Failed to create team. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link
                href="/dashboard/teams"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Teams</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Create New Team</h1>
                        <p className="text-gray-400">Bring your friends together to collaborate</p>
                    </div>
                </div>

                <form onSubmit={createTeam} className="space-y-6">
                    <div>
                        <label className="block text-white font-medium mb-2">Team Name</label>
                        <input
                            type="text"
                            value={newTeam.name}
                            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                            placeholder="e.g. Study Group A"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Description</label>
                        <textarea
                            value={newTeam.description}
                            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                            placeholder="What is this team about?"
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-medium mb-2">Privacy Settings</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setNewTeam({ ...newTeam, isPrivate: false })}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${!newTeam.isPrivate
                                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Globe className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Public</span>
                                <span className="text-xs opacity-70 mt-1">Anyone can join</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewTeam({ ...newTeam, isPrivate: true })}
                                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${newTeam.isPrivate
                                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Lock className="w-8 h-8 mb-2" />
                                <span className="font-semibold">Private</span>
                                <span className="text-xs opacity-70 mt-1">Invite only</span>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all font-semibold text-lg shadow-lg"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating Team...</span>
                                </>
                            ) : (
                                <>
                                    <Users className="w-5 h-5" />
                                    <span>Create Team</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
