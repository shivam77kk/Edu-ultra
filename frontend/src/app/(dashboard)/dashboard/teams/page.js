"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, UserPlus, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const createTeam = async () => {
        const name = prompt("Enter team name:");
        if (!name) return;

        try {
            await api.post("/collaboration/teams", { name, description: "New team" });
            fetchTeams();
        } catch (error) {
            alert("Failed to create team");
        }
    };

    const joinTeam = async (teamId) => {
        try {
            await api.post(`/collaboration/teams/${teamId}/join`);
            fetchTeams();
            alert("Joined team successfully!");
        } catch (error) {
            alert("Failed to join team");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Teams & Collaboration</h1>
                    <p className="text-gray-400">Connect and collaborate with peers</p>
                </div>
                <button
                    onClick={createTeam}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Team</span>
                </button>
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
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{team.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <span>{team.members?.length || 0} members</span>
                            </div>
                            <button
                                onClick={() => joinTeam(team._id)}
                                className="w-full px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center justify-center space-x-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Join Team</span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
