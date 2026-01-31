"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Send, Paperclip, BarChart2, Mail, Link as LinkIcon, X, Loader2, Sparkles, MoreVertical } from "lucide-react";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function TeamDetailsPage() {
    const { id } = useParams(); 
    const router = useRouter();
    const [team, setTeam] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);
    const [socket, setSocket] = useState(null);
    const [showPollModal, setShowPollModal] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const messagesEndRef = useRef(null);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const teamRes = await api.get(`/collaboration/teams`); 
                
                
                
                const teams = (await api.get('/collaboration/teams')).data.data;
                const currentTeam = teams.find(t => t._id === id);
                setTeam(currentTeam);

                
                const msgsRes = await api.get(`/collaboration/teams/${id}/messages`);
                setMessages(msgsRes.data.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching team data:", error);
                setLoading(false);
            }
        };

        fetchData();

        
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
            withCredentials: true
        });
        setSocket(newSocket);

        newSocket.emit("join-room", id, "user-id-placeholder"); 

        newSocket.on("receive-message", (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        return () => newSocket.disconnect();
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { data } = await api.post(`/collaboration/teams/${id}/messages`, {
                content: newMessage,
                type: 'text'
            });
            
            socket.emit("send-message", id, data.data);
            
            
            

            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleInvite = async (type) => {
        if (type === 'link') {
            try {
                const { data } = await api.get(`/collaboration/teams/${id}/invite`);
                const link = `${window.location.origin}/dashboard/teams/join?code=${data.inviteCode}`;
                navigator.clipboard.writeText(link);
                alert("Invite link copied to clipboard!");
            } catch (err) { alert("Failed to get invite link"); }
        } else {
            setSendingInvite(true);
            try {
                await api.post(`/collaboration/teams/${id}/invite-email`, { email: inviteEmail });
                setInviteEmail("");
                setShowInviteModal(false);
                alert("Invitation sent!");
            } catch (err) { alert("Failed to send invitation"); }
            finally { setSendingInvite(false); }
        }
    };

    const createPoll = async () => {
        try {
            const { data } = await api.post(`/collaboration/teams/${id}/polls`, {
                question: pollQuestion,
                options: pollOptions.filter(o => o.trim())
            });
            socket.emit("send-message", id, {
                ...data.data,
                type: 'poll',
                content: 'Poll Created',
                sender: { name: 'System' } 
            });
            
            
            

            
            const msgRes = await api.post(`/collaboration/teams/${id}/messages`, {
                type: 'poll',
                pollId: data.data._id
            });
            socket.emit("send-message", id, msgRes.data.data);

            setShowPollModal(false);
            setPollQuestion("");
            setPollOptions(["", ""]);
        } catch (err) { alert("Failed to create poll"); }
    };

    const votePoll = async (pollId, optionId) => {
        try {
            await api.post(`/collaboration/teams/polls/vote`, { pollId, optionId });
            alert("Vote recorded!");
            
        } catch (err) { alert("Failed to vote"); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
            {}
            <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                            {team?.name?.[0]}
                        </div>
                        <div>
                            <h2 className="font-bold text-white">{team?.name}</h2>
                            <p className="text-xs text-gray-400">{team?.members?.length} members</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Invite Members"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowPollModal(true)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Create Poll"
                        >
                            <BarChart2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender?._id === 'me' ? 'justify-end' : 'justify-start'}`}>
                            {}
                            <div className={`max-w-[70%] rounded-2xl p-4 ${msg.type === 'poll' ? 'bg-gray-800 border border-white/10 w-full max-w-sm' :
                                    'bg-white/5 border border-white/10'
                                }`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-bold text-blue-400">{msg.sender?.name || 'User'}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                </div>

                                {msg.type === 'text' && <p className="text-gray-200">{msg.content}</p>}

                                {msg.type === 'poll' && msg.poll && (
                                    <div className="space-y-2 mt-2">
                                        <p className="font-bold text-white">{msg.poll.question}</p>
                                        <div className="space-y-1">
                                            {msg.poll.options?.map(opt => (
                                                <button
                                                    key={opt._id}
                                                    onClick={() => votePoll(msg.poll._id, opt._id)}
                                                    className="w-full text-left text-sm p-2 rounded bg-white/5 hover:bg-white/10 transition-colors flex justify-between"
                                                >
                                                    <span>{opt.text}</span>
                                                    <span className="text-gray-500">{opt.votes.length}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
                    <div className="flex space-x-2">
                        <button type="button" className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Invite Members</h3>
                                <button onClick={() => setShowInviteModal(false)}><X className="text-gray-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleInvite('link')}
                                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><LinkIcon className="w-5 h-5" /></div>
                                        <div className="text-left">
                                            <p className="font-semibold text-white">Copy Invite Link</p>
                                            <p className="text-sm text-gray-400">Share link directly</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                                </button>

                                <div className="border-t border-white/10 pt-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Invite via Email</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Enter email address"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => handleInvite('email')}
                                            disabled={sendingInvite}
                                            className="px-4 py-2 bg-purple-600 rounded-xl text-white hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {sendingInvite ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {}
            <AnimatePresence>
                {showPollModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Create Poll</h3>
                                <button onClick={() => setShowPollModal(false)}><X className="text-gray-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="space-y-2">
                                    {pollOptions.map((opt, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...pollOptions];
                                                newOpts[i] = e.target.value;
                                                setPollOptions(newOpts);
                                            }}
                                            placeholder={`Option ${i + 1}`}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    ))}
                                    <button
                                        onClick={() => setPollOptions([...pollOptions, ""])}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <button
                                    onClick={createPoll}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold"
                                >
                                    Create Poll
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
