"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, UserPlus, Loader2, X, Lock, Globe } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTeam, setNewTeam] = useState({
        name: '',
        description: '',
        isPrivate: false
    });

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get("/collaboration/teams");
            setTeams(data.data || []);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const createTeam = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/collaboration/teams", newTeam);
            fetchTeams();
            setShowCreateModal(false);
            setNewTeam({ name: '', description: '', isPrivate: false });
        } catch (error) {
            console.error("Failed to create team:", error);
            alert("Failed to create team. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    const joinTeam = async (teamId) => {
        try {
            await api.post(`/collaboration/teams/${teamId}/join`);
            fetchTeams();
        } catch (error) {
            console.error("Failed to join team:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Teams & Collaboration</h1>
                    <p className="text-gray-400">Connect and collaborate with peers</p>
                </div>
                <Link
                    href="/dashboard/teams/create"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Team</span>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No teams yet. Create your first team!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team, index) => (
                        <motion.div
                            key={team._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                            whileHover={{
                                scale: 1.02,
                                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{team.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <span>{team.members?.length || 0} members</span>
                                {team.isPrivate && <Lock className="w-4 h-4" />}
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    href={`/dashboard/teams/${team._id}`}
                                    className="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-2 transition-all"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Open Chat</span>
                                </Link>
                                {!team.members?.includes('current-user-id-check-skipped-for-now') && (
                                    <button
                                        onClick={() => joinTeam(team._id)}
                                        className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
